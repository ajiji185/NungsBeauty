import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { PhotoCanvas } from '../engine/PhotoCanvas';
import { categories, colors, looks, SliderTool, sliderTools, toolsByCategory } from '../theme';
import {
  CategoryId,
  defaultParams,
  EditParams,
  enhancePreset,
  Photo,
  ToolId,
} from '../types';

type Props = {
  photo: Photo;
  onClose: () => void;
  onReplacePhoto: (photo: Photo) => void;
};

function cropRect(width: number, height: number, ratio: number) {
  const current = width / height;
  if (current > ratio) {
    const w = height * ratio;
    return { originX: (width - w) / 2, originY: 0, width: w, height };
  }
  const h = width / ratio;
  return { originX: 0, originY: (height - h) / 2, width, height: h };
}

export function EditorScreen({ photo, onClose, onReplacePhoto }: Props) {
  const [params, setParams] = useState<EditParams>(defaultParams);
  const [category, setCategory] = useState<CategoryId>('retouch');
  const [tool, setTool] = useState<ToolId>('smooth');
  const [comparing, setComparing] = useState(false);
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const [busy, setBusy] = useState(false);
  const shotRef = useRef<View>(null);
  const history = useRef<EditParams[]>([]);

  const look = looks.find((l) => l.id === params.lookId) ?? looks[0];
  const aspect = photo.width / Math.max(photo.height, 1);
  const tools = toolsByCategory[category];
  const showSlider = (sliderTools as readonly string[]).includes(tool);
  const sliderKey = tool as SliderTool;

  const fitted = useMemo(() => {
    if (!frame.width || !frame.height) return { width: 0, height: 0, x: 0, y: 0 };
    const boxA = frame.width / frame.height;
    if (aspect > boxA) {
      const width = frame.width;
      const height = width / aspect;
      return { width, height, x: 0, y: (frame.height - height) / 2 };
    }
    const height = frame.height;
    const width = height * aspect;
    return { width, height, x: (frame.width - width) / 2, y: 0 };
  }, [aspect, frame]);

  const pushHistory = (next = params) => {
    history.current.push({ ...next });
    if (history.current.length > 40) history.current.shift();
  };

  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    setParams(prev);
    Haptics.selectionAsync();
  };

  const pickTool = (id: ToolId) => {
    setTool(id);
    Haptics.selectionAsync();
    if (id === 'flip') void transform('flip');
    if (id === 'rotate') void transform('rotate');
    if (id === 'crop') void transform('crop');
  };

  const enhance = () => {
    pushHistory();
    setParams((p) => ({ ...p, ...enhancePreset() }));
    setCategory('retouch');
    setTool('smooth');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const transform = async (kind: 'flip' | 'rotate' | 'crop') => {
    setBusy(true);
    try {
      const action =
        kind === 'flip'
          ? { flip: ImageManipulator.FlipType.Horizontal }
          : kind === 'rotate'
            ? { rotate: 90 }
            : { crop: cropRect(photo.width, photo.height, 4 / 5) };
      const out = await ImageManipulator.manipulateAsync(photo.uri, [action], {
        compress: 0.92,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      onReplacePhoto({ uri: out.uri, width: out.width, height: out.height });
      Haptics.selectionAsync();
    } catch (e) {
      Alert.alert('Could not edit photo', String(e));
    } finally {
      setBusy(false);
    }
  };

  const save = async (share: boolean) => {
    if (!shotRef.current) return;
    setBusy(true);
    try {
      const file = await captureRef(shotRef, { format: 'jpg', quality: 0.95, result: 'tmpfile' });
      if (share) {
        const can = await Sharing.isAvailableAsync();
        if (!can) {
          Alert.alert('Sharing is not available on this device.');
          return;
        }
        await Sharing.shareAsync(file);
        return;
      }
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Photos access', 'Allow photo library access to save your edit.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(file);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Your photo is in the library.');
    } catch (e) {
      Alert.alert('Could not export', String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.topBtn}>Close</Text>
        </Pressable>
        <Pressable onPress={enhance} style={styles.enhance}>
          <Ionicons name="sparkles" size={14} color={colors.bg} />
          <Text style={styles.enhanceText}>Enhance</Text>
        </Pressable>
        <Pressable onPress={undo} hitSlop={12}>
          <Text style={styles.topBtn}>Undo</Text>
        </Pressable>
      </View>

      <View style={styles.stage} onLayout={(e: LayoutChangeEvent) => setFrame(e.nativeEvent.layout)}>
        {fitted.width > 0 && (
          <View
            ref={shotRef}
            collapsable={false}
            style={[
              styles.canvasWrap,
              { width: fitted.width, height: fitted.height, left: fitted.x, top: fitted.y },
            ]}
          >
            <PhotoCanvas uri={photo.uri} params={params} comparing={comparing} />
          </View>
        )}
      </View>

      <View style={styles.dock}>
        <View style={styles.compareRow}>
          <Pressable
            onPressIn={() => setComparing(true)}
            onPressOut={() => setComparing(false)}
            style={({ pressed }) => [styles.compare, pressed && styles.compareOn]}
          >
            <Text style={styles.compareText}>Hold original</Text>
          </Pressable>
          <Pressable onPress={() => save(true)} style={styles.ghost} disabled={busy}>
            <Text style={styles.ghostText}>Share</Text>
          </Pressable>
          <Pressable onPress={() => save(false)} style={styles.save} disabled={busy}>
            <Text style={styles.saveText}>{busy ? '…' : 'Save'}</Text>
          </Pressable>
        </View>

        {showSlider && (
          <View style={styles.sliderRow}>
            <Text style={styles.percent}>{Math.round(params[sliderKey] * 100)}</Text>
            <View style={styles.sliderTrack}>
              <Slider
                value={params[sliderKey]}
                onChange={(v) => setParams((p) => ({ ...p, [sliderKey]: v }))}
                onStart={() => pushHistory()}
              />
            </View>
          </View>
        )}

        {tool === 'adjust' && (
          <View style={styles.adjustBox}>
            {(
              [
                ['brightness', 'Brightness'],
                ['contrast', 'Contrast'],
                ['saturation', 'Saturation'],
                ['warmth', 'Warmth'],
                ['fade', 'Fade'],
              ] as const
            ).map(([key, label]) => (
              <View key={key} style={styles.adjustRow}>
                <Text style={styles.adjustLabel}>{label}</Text>
                <Slider
                  value={(params[key] + 1) / 2}
                  onChange={(v) => setParams((p) => ({ ...p, [key]: v * 2 - 1 }))}
                  onStart={() => pushHistory()}
                />
              </View>
            ))}
          </View>
        )}

        {category === 'looks' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.looks}>
            {looks.map((item) => {
              const active = item.id === look.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    pushHistory();
                    setParams((p) => ({ ...p, lookId: item.id }));
                    Haptics.selectionAsync();
                  }}
                  style={[styles.look, active && styles.lookOn]}
                >
                  <Text style={[styles.lookText, active && styles.lookTextOn]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {tools.map((t) => {
            const active = t.id === tool;
            return (
              <Pressable key={t.id} onPress={() => pickTool(t.id)} style={[styles.tool, active && styles.toolOn]}>
                <Ionicons name={t.icon as keyof typeof Ionicons.glyphMap} size={18} color={active ? colors.rose : colors.textMuted} />
                <Text style={[styles.toolText, active && styles.toolTextOn]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.cats}>
          {categories.map((c) => {
            const active = c.id === category;
            return (
              <Pressable
                key={c.id}
                onPress={() => {
                  setCategory(c.id);
                  setTool(toolsByCategory[c.id][0].id);
                  Haptics.selectionAsync();
                }}
                style={[styles.cat, active && styles.catOn]}
              >
                <Text style={[styles.catText, active && styles.catTextOn]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function Slider({
  value,
  onChange,
  onStart,
}: {
  value: number;
  onChange: (v: number) => void;
  onStart: () => void;
}) {
  const started = useRef(false);
  const widthRef = useRef(1);
  const apply = (x: number) => onChange(Math.max(0, Math.min(1, x / widthRef.current)));

  return (
    <View
      style={styles.sliderHit}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
      }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => {
        if (!started.current) {
          onStart();
          started.current = true;
        }
        apply(e.nativeEvent.locationX);
      }}
      onResponderMove={(e) => apply(e.nativeEvent.locationX)}
      onResponderRelease={() => {
        started.current = false;
      }}
    >
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${Math.round(value * 100)}%` }]} />
        <View style={[styles.knob, { left: `${Math.round(value * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBtn: { color: colors.rose, fontSize: 16, fontWeight: '600', width: 56 },
  enhance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  enhanceText: { color: colors.bg, fontWeight: '800', fontSize: 13 },
  stage: { flex: 1, marginHorizontal: 12, borderRadius: 18, overflow: 'hidden', backgroundColor: '#000' },
  canvasWrap: { position: 'absolute', overflow: 'hidden', backgroundColor: '#000' },
  dock: {
    paddingTop: 12,
    paddingBottom: 22,
    paddingHorizontal: 12,
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  compareRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  compare: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  compareOn: { backgroundColor: colors.bgToolActive, borderColor: colors.rose },
  compareText: { color: colors.textMuted, fontWeight: '600' },
  ghost: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  ghostText: { color: colors.text, fontWeight: '700' },
  save: {
    backgroundColor: colors.rose,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  saveText: { color: colors.bg, fontWeight: '800' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  percent: { color: colors.text, fontSize: 13, fontWeight: '700', width: 32, textAlign: 'center' },
  sliderTrack: { flex: 1 },
  sliderHit: { height: 32, justifyContent: 'center' },
  bar: { height: 4, backgroundColor: colors.line, borderRadius: 99, justifyContent: 'center' },
  barFill: { height: 4, backgroundColor: colors.rose, borderRadius: 99 },
  knob: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    marginLeft: -9,
  },
  adjustBox: { gap: 8, marginBottom: 8 },
  adjustRow: { gap: 4 },
  adjustLabel: { color: colors.textMuted, fontSize: 12 },
  looks: { gap: 8, paddingBottom: 10 },
  look: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.bgTool,
  },
  lookOn: { backgroundColor: colors.rose },
  lookText: { color: colors.textMuted, fontWeight: '600' },
  lookTextOn: { color: colors.bg },
  rail: { gap: 8, paddingVertical: 6 },
  tool: {
    backgroundColor: colors.bgTool,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
    minWidth: 76,
  },
  toolOn: { backgroundColor: colors.bgToolActive, borderWidth: 1, borderColor: colors.rose },
  toolText: { color: colors.textMuted, fontWeight: '700', fontSize: 11 },
  toolTextOn: { color: colors.rose },
  cats: { flexDirection: 'row', gap: 6, marginTop: 4 },
  cat: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  catOn: { backgroundColor: colors.bgToolActive },
  catText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  catTextOn: { color: colors.text },
});
