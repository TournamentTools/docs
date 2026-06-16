---
id: overlay-config
title: Overlay Config Types
sidebar_label: overlay-config
---

Types for the overlay theme configuration passed to overlays via `hudConfig` in the [bridge payload](./overlay-bridge).

## HudThemeConfig

```ts
interface HudThemeConfig {
  version: 1;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  textColor: string;
  fontFamily: FontFamily;
  customFontUrl: string | null;
  logoPosition: LogoPosition;
  showLogo: boolean;
  showPlayerFlags: boolean;
  showPlayerRanks: boolean;
  showMapStats: boolean;
  cornerRadius: CornerRadius;
  scoreStyle: ScoreStyle;
  customCssOverride: string | null;
}
```

### Default values

```ts
const DEFAULT_HUD_CONFIG: HudThemeConfig = {
  version: 1,
  primaryColor: "#3b82f6",
  accentColor: "#60a5fa",
  backgroundColor: "#000000",
  backgroundOpacity: 0.85,
  textColor: "#ffffff",
  fontFamily: "Inter",
  customFontUrl: null,
  logoPosition: "top-left",
  showLogo: true,
  showPlayerFlags: true,
  showPlayerRanks: true,
  showMapStats: true,
  cornerRadius: "rounded",
  scoreStyle: "indicators",
  customCssOverride: null,
};
```

## Enums

```ts
type LogoPosition = "top-left" | "top-center" | "top-right" | "hidden";
type FontFamily   = "Inter" | "Rajdhani" | "Exo2" | "Oxanium" | "custom";
type CornerRadius = "sharp" | "rounded" | "pill";
type ScoreStyle   = "indicators" | "numbers";
```

## Related

- [Overlay Bridge Types](./overlay-bridge) - payload that carries `hudConfig`
- [Custom Overlay Bridge](../external/custom-overlay-bridge) - how to use `hudConfig` in your overlay
- [Custom CSS Classes](../external/overlay-custom-classes) - CSS classes affected by `cornerRadius` / `scoreStyle`
