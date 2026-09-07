export type ToolId =
  | 'smooth'
  | 'heal'
  | 'glow'
  | 'details'
  | 'reshape'
  | 'whiten'
  | 'blush'
  | 'adjust'
  | 'looks';

export type EditParams = {
  smooth: number;
  heal: number;
  glow: number;
  details: number;
  reshape: number;
  whiten: number;
  blush: number;
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  fade: number;
  lookId: string;
};

export const defaultParams = (): EditParams => ({
  smooth: 0,
  heal: 0,
  glow: 0,
  details: 0,
  reshape: 0,
  whiten: 0,
  blush: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  fade: 0,
  lookId: 'original',
});

export const MASK_SIZE = 128;
