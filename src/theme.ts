export const colors = {
  bg: '#070608',
  bgElevated: '#121014',
  bgTool: '#1C181C',
  bgToolActive: '#2A2228',
  text: '#F7F1F3',
  textMuted: '#9A8E93',
  rose: '#E8A0B0',
  roseDeep: '#C56B82',
  gold: '#E6C79A',
  line: '#2C262A',
  white: '#FFFFFF',
};

export const tools = [
  { id: 'smooth', label: 'Smooth', kind: 'brush' },
  { id: 'heal', label: 'Heal', kind: 'brush' },
  { id: 'glow', label: 'Glow', kind: 'global' },
  { id: 'details', label: 'Details', kind: 'global' },
  { id: 'reshape', label: 'Reshape', kind: 'global' },
  { id: 'whiten', label: 'Whiten', kind: 'brush' },
  { id: 'blush', label: 'Blush', kind: 'brush' },
  { id: 'adjust', label: 'Adjust', kind: 'adjust' },
  { id: 'looks', label: 'Looks', kind: 'looks' },
] as const;

export const looks = [
  { id: 'original', label: 'Original', tint: [1, 1, 1], amount: 0, warmth: 0, fade: 0, contrast: 0 },
  { id: 'soft', label: 'Soft', tint: [1.05, 0.98, 1.02], amount: 0.28, warmth: 0.18, fade: 0.12, contrast: -0.08 },
  { id: 'glow', label: 'Glow', tint: [1.08, 1.02, 0.96], amount: 0.35, warmth: 0.22, fade: 0.08, contrast: -0.04 },
  { id: 'fresh', label: 'Fresh', tint: [0.96, 1.02, 1.06], amount: 0.22, warmth: -0.08, fade: 0, contrast: 0.12 },
  { id: 'warm', label: 'Warm', tint: [1.12, 1.0, 0.88], amount: 0.4, warmth: 0.45, fade: 0.05, contrast: 0.04 },
  { id: 'cool', label: 'Cool', tint: [0.9, 0.98, 1.12], amount: 0.38, warmth: -0.35, fade: 0.04, contrast: 0.06 },
  { id: 'film', label: 'Film', tint: [1.04, 0.96, 0.9], amount: 0.32, warmth: 0.12, fade: 0.22, contrast: 0.1 },
  { id: 'night', label: 'Night', tint: [0.92, 0.94, 1.08], amount: 0.3, warmth: -0.12, fade: 0.1, contrast: 0.18 },
] as const;
