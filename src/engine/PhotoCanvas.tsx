import { Image, StyleSheet, View } from 'react-native';
import { looks } from '../theme';
import { EditParams } from '../types';

export type Stamp = {
  nx: number;
  ny: number;
  tool: 'smooth' | 'heal' | 'whiten' | 'blush';
};

type Props = {
  uri: string;
  params: EditParams;
  comparing: boolean;
  stamps: Stamp[];
};

const fill = { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 };

export function PhotoCanvas({ uri, params, comparing, stamps }: Props) {
  const look = looks.find((l) => l.id === params.lookId) ?? looks[0];
  const slim = comparing ? 1 : 1 - params.reshape * 0.16;
  const src = { uri };

  if (comparing) {
    return <Image source={src} style={styles.photo} resizeMode="cover" />;
  }

  const warmth = params.warmth + look.warmth;
  const fade = params.fade + look.fade;
  const contrast = params.contrast + look.contrast * 0.6 + params.details * 0.35;

  return (
    <View style={[styles.photo, { transform: [{ scaleX: slim }] }]} collapsable={false}>
      <Image source={src} style={styles.photo} resizeMode="cover" />

      {params.smooth > 0.01 && (
        <Image
          source={src}
          blurRadius={6 + params.smooth * 18}
          style={[fill, { opacity: params.smooth * 0.88 }]}
          resizeMode="cover"
        />
      )}
      {params.heal > 0.01 && (
        <Image
          source={src}
          blurRadius={14 + params.heal * 22}
          style={[fill, { opacity: params.heal * 0.72 }]}
          resizeMode="cover"
        />
      )}
      {params.glow > 0.01 && (
        <Image
          source={src}
          blurRadius={20}
          style={[fill, { opacity: params.glow * 0.45 }]}
          resizeMode="cover"
        />
      )}

      {params.whiten > 0 && (
        <View style={[fill, { backgroundColor: 'rgba(255,255,252,0.42)', opacity: params.whiten * 0.55 }]} />
      )}
      {params.blush > 0 && (
        <View style={[fill, { backgroundColor: 'rgba(232,120,140,0.55)', opacity: params.blush * 0.28 }]} />
      )}
      {params.brightness > 0 && (
        <View style={[fill, { backgroundColor: '#fff', opacity: params.brightness * 0.45 }]} />
      )}
      {params.brightness < 0 && (
        <View style={[fill, { backgroundColor: '#000', opacity: Math.abs(params.brightness) * 0.45 }]} />
      )}
      {warmth > 0 && (
        <View style={[fill, { backgroundColor: 'rgba(255,170,80,0.55)', opacity: warmth * 0.28 }]} />
      )}
      {warmth < 0 && (
        <View style={[fill, { backgroundColor: 'rgba(80,140,255,0.55)', opacity: Math.abs(warmth) * 0.28 }]} />
      )}
      {params.saturation < 0 && (
        <View style={[fill, { backgroundColor: 'rgba(128,128,128,0.7)', opacity: Math.abs(params.saturation) * 0.45 }]} />
      )}
      {contrast > 0 && (
        <View style={[fill, { backgroundColor: '#000', opacity: contrast * 0.12 }]} />
      )}
      {fade > 0 && (
        <View style={[fill, { backgroundColor: 'rgba(150,145,140,0.8)', opacity: fade * 0.28 }]} />
      )}
      {look.amount > 0 && (
        <View
          style={[
            fill,
            {
              backgroundColor: `rgba(${Math.round(look.tint[0] * 180)},${Math.round(look.tint[1] * 160)},${Math.round(look.tint[2] * 150)},0.5)`,
              opacity: look.amount * 0.5,
            },
          ]}
        />
      )}
      {params.glow > 0 && (
        <View style={[fill, { backgroundColor: 'rgba(255,236,220,0.7)', opacity: params.glow * 0.18 }]} />
      )}

      {stamps.map((s, i) => {
        const size = s.tool === 'heal' ? 92 : 78;
        return (
          <View
            key={`${s.tool}-${i}`}
            style={{
              position: 'absolute',
              left: `${s.nx * 100}%`,
              top: `${s.ny * 100}%`,
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: size / 2,
              overflow: 'hidden',
            }}
          >
            {s.tool === 'smooth' || s.tool === 'heal' ? (
              <Image source={src} blurRadius={s.tool === 'heal' ? 24 : 14} style={{ width: size, height: size }} />
            ) : (
              <View
                style={{
                  flex: 1,
                  backgroundColor: s.tool === 'whiten' ? 'rgba(255,255,252,0.45)' : 'rgba(232,120,140,0.35)',
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { width: '100%', height: '100%' },
});
