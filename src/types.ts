export type CategoryId = 'retouch' | 'reshape' | 'makeup' | 'looks' | 'edit';

export type ToolId =
  | 'smooth'
  | 'blemish'
  | 'teeth'
  | 'brighten'
  | 'face'
  | 'jaw'
  | 'eyes'
  | 'blush'
  | 'lips'
  | 'glow'
  | 'contour'
  | 'details'
  | 'adjust'
  | 'looks'
  | 'flip'
  | 'rotate'
  | 'crop';

export type EditParams = {
  smooth: number;
  blemish: number;
  teeth: number;
  brighten: number;
  face: number;
  jaw: number;
  eyes: number;
  blush: number;
  lips: number;
  glow: number;
  contour: number;
  details: number;
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  fade: number;
  lookId: string;
};

export const defaultParams = (): EditParams => ({
  smooth: 0,
  blemish: 0,
  teeth: 0,
  brighten: 0,
  face: 0,
  jaw: 0,
  eyes: 0,
  blush: 0,
  lips: 0,
  glow: 0,
  contour: 0,
  details: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  fade: 0,
  lookId: 'original',
});

export const enhancePreset = (): Partial<EditParams> => ({
  smooth: 0.38,
  glow: 0.22,
  brighten: 0.18,
  details: 0.12,
  teeth: 0.16,
  warmth: 0.08,
});

export type Photo = { uri: string; width: number; height: number };
