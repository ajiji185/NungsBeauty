import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { PhotoCanvas, Stamp } from '../engine/PhotoCanvas';
import { colors, looks, tools } from '../theme';
import { defaultParams, EditParams, ToolId } from '../types';

type Props = {
  uri: string;
  imageSize: { width: number; height: number };
  onClose: () => void;
};

const BRUSH_TOOLS: Stamp['tool'][] = ['smooth', 'heal', 'whiten', 'blush'];

export function EditorScreen({ uri, imageSize, onClose }: Props) {
  const [params, setParams] = useState<EditParams>(defaultParams);
  const [tool, setTool] = useState<ToolId>('smooth');
  const [comparing, setComparing] = useState(false);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const [saving, setSaving] = useState(false);
  const shotRef = useRef<View>(null);
  const history = useRef<{ params: EditParams; stamps: Stamp[] }[]>([]);
  const painting = useRef(false);
  const lastStamp = useRef({ nx: -1, ny: -1 });

  const look = looks.find((l) => l.id === params.lookId) ?? looks[0];
  const isBrush = BRUSH_TOOLS.includes(tool as Stamp['tool']);
  const aspect = imageSize.width / Math.max(imageSize.height, 1);

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

  const pushHistory = (nextParams = params, nextStamps = stamps) => {
    history.current.push({ params: { ...nextParams }, stamps: [...nextStamps] });
    if (history.current.length > 30) history.current.shift();
  };

  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    setParams(prev.params);
    setStamps(prev.stamps);
    Haptics.selectionAsync();
  };

  const setToolId = (id: ToolId) => {
    setTool(id);
    Haptics.selectionAsync();
  };

  const sliderValue = () => {
    if (tool === 'adjust' || tool === 'looks') return 0;
    return params[tool];
  };

  const setSlider = (value: number) => {
    if (tool === 'adjust' || tool === 'looks') return;
    setParams((p) => ({ ...p, [tool]: value }));
  };

  const onFrame = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setFrame({ width, height });
  };

  const paintAt = (evt: GestureResponderEvent, start: boolean) => {
    if (!BRUSH_TOOLS.includes(tool as Stamp['tool'])) return;
    const { locationX, locationY } = evt.nativeEvent;
    const nx = locationX / Math.max(fitted.width, 1);
    const ny = locationY / Math.max(fitted.height, 1);
    if (nx < 0 || ny < 0 || nx > 1 || ny > 1) return;
    if (start) {
      pushHistory();
      painting.current = true;
      lastStamp.current = { nx: -1, ny: -1 };
    }
    if (!painting.current) return;
    const dx = nx - lastStamp.current.nx;
    const dy = ny - lastStamp.current.ny;
    if (lastStamp.current.nx >= 0 && Math.hypot(dx, dy) < 0.03) return;
    lastStamp.current = { nx, ny };
    setStamps((prev) => [...prev, { nx, ny, tool: tool as Stamp['tool'] }]);
  };

  const save = async () => {
    if (!shotRef.current) return;
    setSaving(true);
    try {
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Photos access', 'Allow photo library access to save your edit.');
        return;
      }
      const file = await captureRef(shotRef, {
        format: 'jpg',
        quality: 0.95,
        result: 'tmpfile',
      });
      await MediaLibrary.saveToLibraryAsync(file);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Your photo is in the library.');
    } catch (e) {
      Alert.alert('Could not save', String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.topBtn}>Close</Text>
        </Pressable>
        <Text style={styles.brand}>Nung's Beauty</Text>
        <Pressable onPress={undo} hitSlop={12}>
          <Text style={styles.topBtn}>Undo</Text>
        </Pressable>
      </View>

      <View style={styles.stage} onLayout={onFrame}>
        {fitted.width > 0 && (
          <View
            ref={shotRef}
            collapsable={false}
            style={[
              styles.canvasWrap,
              { width: fitted.width, height: fitted.height, left: fitted.x, top: fitted.y },
            ]}
            onStartShouldSetResponder={() => isBrush}
            onMoveShouldSetResponder={() => isBrush}
            onResponderGrant={(e) => paintAt(e, true)}
            onResponderMove={(e) => paintAt(e, false)}
            onResponderRelease={() => {
              painting.current = false;
            }}
          >
            <PhotoCanvas uri={uri} params={params} comparing={comparing} stamps={stamps} />
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
            <Text style={styles.compareText}>Hold to compare</Text>
          </Pressable>
          <Pressable onPress={save} style={styles.save} disabled={saving}>
            <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>

        {isBrush && (
          <Text style={styles.hint}>Raise the slider to apply. Paint to target a spot.</Text>
        )}

        {tool !== 'adjust' && tool !== 'looks' && (
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>0</Text>
            <View style={styles.sliderTrack}>
              <Slider
                value={sliderValue()}
                onChange={(v) => setSlider(v)}
                onStart={() => pushHistory()}
              />
            </View>
            <Text style={styles.sliderLabel}>100</Text>
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

        {tool === 'looks' && (
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
              <Pressable key={t.id} onPress={() => setToolId(t.id)} style={[styles.tool, active && styles.toolOn]}>
                <Text style={[styles.toolText, active && styles.toolTextOn]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
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

  const apply = (x: number) => {
    const v = Math.max(0, Math.min(1, x / widthRef.current));
    onChange(v);
  };

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
    paddingHorizontal: 18,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { color: colors.text, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  topBtn: { color: colors.rose, fontSize: 16, fontWeight: '600' },
  stage: { flex: 1, marginHorizontal: 12, borderRadius: 18, overflow: 'hidden', backgroundColor: '#000' },
  canvasWrap: { position: 'absolute', overflow: 'hidden', backgroundColor: '#000' },
  dock: {
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 12,
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  compareRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
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
  save: {
    backgroundColor: colors.rose,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  saveText: { color: colors.bg, fontWeight: '800' },
  hint: { color: colors.textMuted, fontSize: 13, marginBottom: 8, paddingHorizontal: 4 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sliderLabel: { color: colors.textMuted, fontSize: 11, width: 24, textAlign: 'center' },
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
  rail: { gap: 8, paddingTop: 4 },
  tool: {
    backgroundColor: colors.bgTool,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  toolOn: { backgroundColor: colors.bgToolActive, borderWidth: 1, borderColor: colors.rose },
  toolText: { color: colors.textMuted, fontWeight: '700' },
  toolTextOn: { color: colors.rose },
});
