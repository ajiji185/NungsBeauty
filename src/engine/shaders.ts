export const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = vec2(position.x * 0.5 + 0.5, 1.0 - (position.y * 0.5 + 0.5));
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uMask;
uniform float uSmooth;
uniform float uHeal;
uniform float uGlow;
uniform float uDetails;
uniform float uReshape;
uniform float uWhiten;
uniform float uBlush;
uniform float uBrightness;
uniform float uContrast;
uniform float uSaturation;
uniform float uWarmth;
uniform float uFade;
uniform vec3 uLookTint;
uniform float uLookAmount;
uniform float uLookWarmth;
uniform float uLookFade;
uniform float uLookContrast;
uniform float uCompare;
uniform vec2 uTexel;

vec3 sampleRgb(vec2 uv) {
  return texture2D(uImage, clamp(uv, 0.0, 1.0)).rgb;
}

vec3 blur9(vec2 uv, float spread) {
  vec2 t = uTexel * spread;
  vec3 c = sampleRgb(uv) * 0.25;
  c += sampleRgb(uv + vec2(-t.x, 0.0)) * 0.125;
  c += sampleRgb(uv + vec2(t.x, 0.0)) * 0.125;
  c += sampleRgb(uv + vec2(0.0, -t.y)) * 0.125;
  c += sampleRgb(uv + vec2(0.0, t.y)) * 0.125;
  c += sampleRgb(uv + vec2(-t.x, -t.y)) * 0.0625;
  c += sampleRgb(uv + vec2(t.x, -t.y)) * 0.0625;
  c += sampleRgb(uv + vec2(-t.x, t.y)) * 0.0625;
  c += sampleRgb(uv + vec2(t.x, t.y)) * 0.0625;
  return c;
}

void main() {
  vec2 uv = vUv;
  float yW = smoothstep(0.12, 0.48, uv.y) * (1.0 - smoothstep(0.52, 0.88, uv.y));
  float slim = uReshape * 0.32 * (1.0 - uCompare);
  uv.x = 0.5 + (uv.x - 0.5) * mix(1.0, 1.0 - slim, yW);

  vec4 src = texture2D(uImage, clamp(uv, 0.0, 1.0));
  vec3 col = src.rgb;
  vec4 mask = texture2D(uMask, clamp(uv, 0.0, 1.0));

  if (uCompare < 0.5) {
    float smoothAmt = clamp(uSmooth + mask.r, 0.0, 1.0);
    float healAmt = clamp(uHeal + mask.g, 0.0, 1.0);
    float whiteAmt = clamp(uWhiten + mask.b, 0.0, 1.0);
    float blushAmt = clamp(uBlush + mask.a, 0.0, 1.0);

    vec3 soft = blur9(uv, 2.2 + smoothAmt * 6.0);
    vec3 healed = blur9(uv, 8.0);
    col = mix(col, soft, smoothAmt * 0.85);
    col = mix(col, mix(healed, col, 0.15), healAmt * 0.9);

    col += uBrightness * 0.45;
    col = (col - 0.5) * (1.0 + uContrast * 0.8 + uLookContrast * 0.6 + uDetails * 0.35) + 0.5;

    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, 1.0 + uSaturation * 0.7);

    float warmth = uWarmth + uLookWarmth;
    col.r += warmth * 0.10;
    col.b -= warmth * 0.08;

    vec3 lifted = col * 0.55 + vec3(0.42, 0.43, 0.45);
    col = mix(col, lifted, whiteAmt * 0.55);

    float cheek = smoothstep(0.28, 0.62, uv.y) * (1.0 - smoothstep(0.62, 0.82, uv.y));
    cheek *= pow(1.0 - abs(uv.x - 0.5) * 1.7, 1.4);
    col = mix(col, col * vec3(1.08, 0.82, 0.88) + vec3(0.06, 0.0, 0.02), blushAmt * cheek * 0.75);

    col += uGlow * 0.14 * vec3(1.0, 0.94, 0.88);
    col = mix(col, col * uLookTint, uLookAmount);
    col = mix(col, vec3(0.52, 0.5, 0.48), (uFade + uLookFade) * 0.28);
  }

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), src.a);
}
`;
