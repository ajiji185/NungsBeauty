# Nung's Beauty

iOS-style selfie retouching app (FaceTune-like), built with Expo. Smooth skin, heal, glow, reshape, whiten, blush, color adjust, and looks — then save back to the camera roll.

## Run on iPhone

1. Install [Expo Go](https://apps.apple.com/app/expo-go/id982107779).
2. On this computer:

```bash
cd NungsBeauty
npm start
```

3. Scan the QR code with the Camera app (or Expo Go). Phone and computer must be on the same Wi-Fi.

## Tools

- **Smooth / Heal / Whiten / Blush** — paint on the photo, then raise strength
- **Glow / Details / Reshape** — whole-image sliders (reshape slims the face)
- **Adjust** — brightness, contrast, saturation, warmth, fade
- **Looks** — Soft, Glow, Fresh, Warm, Cool, Film, Night
- Hold **Compare** to see the original. **Save** writes PNG to Photos.

A Mac + Apple Developer account is required later if you want a standalone App Store build (`npx expo prebuild` / EAS).
