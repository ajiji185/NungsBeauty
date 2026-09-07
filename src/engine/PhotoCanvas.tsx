import { Image, StyleSheet, View } from 'react-native';
import { looks } from '../theme';
import { EditParams } from '../types';

type Props = {
  uri: string;
  params: EditParams;
  comparing: boolean;
};

const fill = { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 };

export function PhotoCanvas({ uri, params, comparing }: Props) {
  const look = looks.find((l) => l.id === params.lookId) ?? looks[0];
  const slim = comparing ? 1 : 1 - params.face * 0.14 - params.jaw * 0.08;
  const src = { uri };

  if (comparing) {
    return <Image source={src} style={styles.photo} resizeMode="cover" />;
  }

  const warmth = params.warmth + look.warmth;
  const fade = params.fade + look.fade;
  const contrast = params.contrast + look.contrast * 0.6 + params.details * 0.35;
  const lift = params.brightness + params.brighten * 0.7;

  return (
    <View style={[styles.photo, { transform: [{ scaleX: slim }] }]} collapsable={false}>
      <Image source={src} style={styles.photo} resizeMode="cover" />

      {params.smooth > 0.01 && (
        <Image
          source={src}
          blurRadius={3 + params.smooth * 10}
          style={[fill, { opacity: params.smooth * 0.5 }]}
          resizeMode="cover"
        />
      )}
      {params.blemish > 0.01 && (
        <Image
          source={src}
          blurRadius={7 + params.blemish * 12}
          style={[fill, { opacity: params.blemish * 0.38 }]}
          resizeMode="cover"
        />
      )}
      {params.glow > 0.01 && (
        <Image
          source={src}
          blurRadius={16}
          style={[fill, { opacity: params.glow * 0.3 }]}
          resizeMode="cover"
        />
      )}

      {params.teeth > 0 && (
        <View
          style={{
            position: 'absolute',
            left: '36%',
            width: '28%',
            top: '58%',
            height: '7%',
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,250,0.55)',
            opacity: params.teeth * 0.55,
          }}
        />
      )}
      {params.lips > 0 && (
        <View
          style={{
            position: 'absolute',
            left: '37%',
            width: '26%',
            top: '59%',
            height: '8%',
            borderRadius: 18,
            backgroundColor: 'rgba(190,50,80,0.55)',
            opacity: params.lips * 0.42,
          }}
        />
      )}
      {params.eyes > 0 && (
        <>
          <View style={[styles.eye, { left: '28%', opacity: params.eyes * 0.45 }]} />
          <View style={[styles.eye, { right: '28%', opacity: params.eyes * 0.45 }]} />
        </>
      )}
      {params.blush > 0 && (
        <>
          <View style={[styles.cheek, { left: '14%', opacity: params.blush * 0.35 }]} />
          <View style={[styles.cheek, { right: '14%', opacity: params.blush * 0.35 }]} />
        </>
      )}
      {params.contour > 0 && (
        <>
          <View style={[styles.contour, { left: 0, opacity: params.contour * 0.35 }]} />
          <View style={[styles.contour, { right: 0, opacity: params.contour * 0.35 }]} />
        </>
      )}

      {lift > 0 && <View style={[fill, { backgroundColor: '#fff', opacity: lift * 0.38 }]} />}
      {params.brightness < 0 && (
        <View style={[fill, { backgroundColor: '#000', opacity: Math.abs(params.brightness) * 0.4 }]} />
      )}
      {warmth > 0 && (
        <View style={[fill, { backgroundColor: 'rgba(255,170,80,0.55)', opacity: warmth * 0.24 }]} />
      )}
      {warmth < 0 && (
        <View style={[fill, { backgroundColor: 'rgba(80,140,255,0.55)', opacity: Math.abs(warmth) * 0.24 }]} />
      )}
      {params.saturation < 0 && (
        <View style={[fill, { backgroundColor: 'rgba(128,128,128,0.7)', opacity: Math.abs(params.saturation) * 0.4 }]} />
      )}
      {contrast > 0 && <View style={[fill, { backgroundColor: '#000', opacity: contrast * 0.1 }]} />}
      {fade > 0 && (
        <View style={[fill, { backgroundColor: 'rgba(150,145,140,0.8)', opacity: fade * 0.24 }]} />
      )}
      {look.amount > 0 && (
        <View
          style={[
            fill,
            {
              backgroundColor: `rgba(${Math.round(look.tint[0] * 180)},${Math.round(look.tint[1] * 160)},${Math.round(look.tint[2] * 150)},0.5)`,
              opacity: look.amount * 0.42,
            },
          ]}
        />
      )}
      {params.glow > 0 && (
        <View style={[fill, { backgroundColor: 'rgba(255,236,220,0.7)', opacity: params.glow * 0.14 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', height: '100%' },
  eye: {
    position: 'absolute',
    top: '36%',
    width: 54,
    height: 28,
    borderRadius: 20,
    backgroundColor: 'rgba(180,220,255,0.55)',
  },
  cheek: {
    position: 'absolute',
    top: '46%',
    width: 70,
    height: 46,
    borderRadius: 40,
    backgroundColor: 'rgba(232,120,140,0.7)',
  },
  contour: {
    position: 'absolute',
    top: '18%',
    width: '18%',
    height: '62%',
    backgroundColor: 'rgba(40,20,20,0.65)',
  },
});
