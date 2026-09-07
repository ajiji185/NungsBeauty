import { CategoryId, EditParams, ToolId } from './types';

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

export const categories: { id: CategoryId; label: string }[] = [
  { id: 'retouch', label: 'Retouch' },
  { id: 'reshape', label: 'Reshape' },
  { id: 'makeup', label: 'Makeup' },
  { id: 'looks', label: 'Looks' },
  { id: 'edit', label: 'Edit' },
];

export const toolsByCategory: Record<CategoryId, { id: ToolId; label: string; icon: string }[]> = {
  retouch: [
    { id: 'smooth', label: 'Smooth', icon: 'sparkles-outline' },
    { id: 'blemish', label: 'Blemish', icon: 'remove-circle-outline' },
    { id: 'teeth', label: 'Teeth', icon: 'happy-outline' },
    { id: 'brighten', label: 'Brighten', icon: 'sunny-outline' },
    { id: 'details', label: 'Details', icon: 'contrast-outline' },
  ],
  reshape: [
    { id: 'face', label: 'Face slim', icon: 'person-outline' },
    { id: 'jaw', label: 'Jaw', icon: 'git-commit-outline' },
    { id: 'eyes', label: 'Eyes', icon: 'eye-outline' },
  ],
  makeup: [
    { id: 'blush', label: 'Blush', icon: 'flower-outline' },
    { id: 'lips', label: 'Lips', icon: 'heart-outline' },
    { id: 'glow', label: 'Glow', icon: 'radio-button-on-outline' },
    { id: 'contour', label: 'Contour', icon: 'triangle-outline' },
  ],
  looks: [{ id: 'looks', label: 'Looks', icon: 'color-filter-outline' }],
  edit: [
    { id: 'adjust', label: 'Adjust', icon: 'options-outline' },
    { id: 'flip', label: 'Flip', icon: 'swap-horizontal-outline' },
    { id: 'rotate', label: 'Rotate', icon: 'refresh-outline' },
    { id: 'crop', label: 'Crop 4:5', icon: 'crop-outline' },
  ],
};

export const looks = [
  { id: 'original', label: 'Original', tint: [1, 1, 1], amount: 0, warmth: 0, fade: 0, contrast: 0 },
  { id: 'natural', label: 'Natural', tint: [1.04, 1.0, 0.98], amount: 0.18, warmth: 0.1, fade: 0.04, contrast: 0.04 },
  { id: 'glam', label: 'Glam', tint: [1.08, 0.96, 1.02], amount: 0.34, warmth: 0.12, fade: 0.06, contrast: 0.1 },
  { id: 'soft', label: 'Soft', tint: [1.05, 0.98, 1.02], amount: 0.28, warmth: 0.18, fade: 0.12, contrast: -0.08 },
  { id: 'bronze', label: 'Bronze', tint: [1.14, 1.0, 0.82], amount: 0.4, warmth: 0.42, fade: 0.05, contrast: 0.08 },
  { id: 'fresh', label: 'Fresh', tint: [0.96, 1.02, 1.06], amount: 0.22, warmth: -0.08, fade: 0, contrast: 0.12 },
  { id: 'porcelain', label: 'Porcelain', tint: [1.02, 1.0, 1.06], amount: 0.26, warmth: -0.06, fade: 0.08, contrast: -0.04 },
  { id: 'golden', label: 'Golden', tint: [1.12, 1.02, 0.88], amount: 0.38, warmth: 0.38, fade: 0.08, contrast: 0.06 },
  { id: 'cool', label: 'Cool', tint: [0.9, 0.98, 1.12], amount: 0.38, warmth: -0.35, fade: 0.04, contrast: 0.06 },
  { id: 'film', label: 'Film', tint: [1.04, 0.96, 0.9], amount: 0.32, warmth: 0.12, fade: 0.22, contrast: 0.1 },
] as const;

export const sliderTools = [
  'smooth',
  'blemish',
  'teeth',
  'brighten',
  'face',
  'jaw',
  'eyes',
  'blush',
  'lips',
  'glow',
  'contour',
  'details',
] as const satisfies readonly (keyof EditParams)[];

export type SliderTool = (typeof sliderTools)[number];
