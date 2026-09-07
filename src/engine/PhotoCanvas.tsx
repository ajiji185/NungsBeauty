import { Asset } from 'expo-asset';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { FRAG, VERT } from './shaders';
import { EditParams, MASK_SIZE } from '../types';
import { looks } from '../theme';

type Props = {
  uri: string;
  params: EditParams;
  mask: Uint8Array;
  maskVersion: number;
  comparing: boolean;
  imageSize: { width: number; height: number };
  onGlReady: (gl: ExpoWebGLRenderingContext) => void;
};

function compile(gl: ExpoWebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || 'compile');
  }
  return shader;
}

export function PhotoCanvas({
  uri,
  params,
  mask,
  maskVersion,
  comparing,
  imageSize,
  onGlReady,
}: Props) {
  const paramsRef = useRef(params);
  const maskRef = useRef(mask);
  const compareRef = useRef(comparing);
  const sizeRef = useRef(imageSize);
  const glRef = useRef<ExpoWebGLRenderingContext | null>(null);
  const locRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const maskTexRef = useRef<WebGLTexture | null>(null);
  const rafRef = useRef<number>(0);
  const uploadedMaskRef = useRef(-1);
  const maskTickRef = useRef(maskVersion);

  paramsRef.current = params;
  maskRef.current = mask;
  compareRef.current = comparing;
  sizeRef.current = imageSize;
  maskTickRef.current = maskVersion;

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    glRef.current = gl;
    onGlReady(gl);

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'link');
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const pos = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const names = [
      'uSmooth',
      'uHeal',
      'uGlow',
      'uDetails',
      'uReshape',
      'uWhiten',
      'uBlush',
      'uBrightness',
      'uContrast',
      'uSaturation',
      'uWarmth',
      'uFade',
      'uLookTint',
      'uLookAmount',
      'uLookWarmth',
      'uLookFade',
      'uLookContrast',
      'uCompare',
      'uTexel',
      'uImage',
      'uMask',
    ];
    const loc: Record<string, WebGLUniformLocation | null> = {};
    names.forEach((n) => {
      loc[n] = gl.getUniformLocation(program, n);
    });
    locRef.current = loc;

    const imgTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imgTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const asset = Asset.fromURI(uri);
    await asset.downloadAsync();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, asset as unknown as TexImageSource);

    const maskTex = gl.createTexture();
    maskTexRef.current = maskTex;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      MASK_SIZE,
      MASK_SIZE,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      maskRef.current
    );

    gl.uniform1i(loc.uImage, 0);
    gl.uniform1i(loc.uMask, 1);

    const draw = () => {
      const g = glRef.current;
      if (!g) return;
      const p = paramsRef.current;
      const look = looks.find((l) => l.id === p.lookId) ?? looks[0];
      const L = locRef.current;
      const off = compareRef.current ? 1 : 0;

      if (uploadedMaskRef.current !== maskTickRef.current && maskTexRef.current) {
        uploadedMaskRef.current = maskTickRef.current;
        g.activeTexture(g.TEXTURE1);
        g.bindTexture(g.TEXTURE_2D, maskTexRef.current);
        g.texImage2D(
          g.TEXTURE_2D,
          0,
          g.RGBA,
          MASK_SIZE,
          MASK_SIZE,
          0,
          g.RGBA,
          g.UNSIGNED_BYTE,
          maskRef.current
        );
      }

      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
      g.uniform1f(L.uSmooth, p.smooth);
      g.uniform1f(L.uHeal, p.heal);
      g.uniform1f(L.uGlow, p.glow);
      g.uniform1f(L.uDetails, p.details);
      g.uniform1f(L.uReshape, p.reshape);
      g.uniform1f(L.uWhiten, p.whiten);
      g.uniform1f(L.uBlush, p.blush);
      g.uniform1f(L.uBrightness, p.brightness);
      g.uniform1f(L.uContrast, p.contrast);
      g.uniform1f(L.uSaturation, p.saturation);
      g.uniform1f(L.uWarmth, p.warmth);
      g.uniform1f(L.uFade, p.fade);
      g.uniform3f(L.uLookTint, look.tint[0], look.tint[1], look.tint[2]);
      g.uniform1f(L.uLookAmount, look.amount);
      g.uniform1f(L.uLookWarmth, look.warmth);
      g.uniform1f(L.uLookFade, look.fade);
      g.uniform1f(L.uLookContrast, look.contrast);
      g.uniform1f(L.uCompare, off);
      g.uniform2f(
        L.uTexel,
        1 / Math.max(sizeRef.current.width, 1),
        1 / Math.max(sizeRef.current.height, 1)
      );
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      g.endFrameEXP();
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  return <GLView style={styles.fill} onContextCreate={onContextCreate} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
});
