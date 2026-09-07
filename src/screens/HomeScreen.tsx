import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  onCamera: () => void;
  onLibrary: () => void;
};

export function HomeScreen({ onCamera, onLibrary }: Props) {
  return (
    <View style={styles.root}>
      <View style={[styles.orb, styles.orbA]} />
      <View style={[styles.orb, styles.orbB]} />
      <LinearGradient colors={['transparent', colors.bg]} style={styles.fade} />

      <View style={styles.hero}>
        <Text style={styles.kicker}>EVERYDAY EDITOR</Text>
        <Text style={styles.title}>Nung's{'\n'}Beauty</Text>
        <Text style={styles.sub}>
          Retouch, reshape, makeup, and looks — one-tap Enhance, then fine-tune like a studio in your pocket.
        </Text>
        <View style={styles.pills}>
          {['Smooth', 'Teeth', 'Face slim', 'Makeup', 'Looks'].map((p) => (
            <View key={p} style={styles.pill}>
              <Text style={styles.pillText}>{p}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onCamera} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
          <Text style={styles.primaryLabel}>Take a selfie</Text>
        </Pressable>
        <Pressable onPress={onLibrary} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryLabel}>Choose from library</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 28, justifyContent: 'space-between' },
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.45 },
  orbA: { width: 280, height: 280, backgroundColor: '#5A2238', top: -40, right: -60 },
  orbB: { width: 220, height: 220, backgroundColor: '#3A2A18', top: 160, left: -80 },
  fade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  hero: { marginTop: 108 },
  kicker: { color: colors.gold, letterSpacing: 3, fontSize: 12, fontWeight: '700', marginBottom: 16 },
  title: { color: colors.text, fontSize: 52, fontWeight: '300', lineHeight: 58, letterSpacing: -1 },
  sub: { color: colors.textMuted, fontSize: 16, lineHeight: 24, marginTop: 18, maxWidth: 320 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 22 },
  pill: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  actions: { marginBottom: 48, gap: 12 },
  primary: {
    backgroundColor: colors.rose,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryLabel: { color: colors.bg, fontSize: 17, fontWeight: '700' },
  secondary: {
    backgroundColor: colors.bgElevated,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  secondaryLabel: { color: colors.text, fontSize: 17, fontWeight: '600' },
  pressed: { opacity: 0.82 },
});
