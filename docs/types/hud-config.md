---
id: hud-config
title: HUD Config Types
sidebar_label: hud-config
---

Types for the HUD theme configuration passed to overlays via `hudConfig` in the [bridge payload](./hud-bridge).

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

- [HUD Bridge Types](./hud-bridge) - payload that carries `hudConfig`
- [Custom HUD Bridge](../external/custom-hud-bridge) - how to use `hudConfig` in your overlay
- [Custom CSS Classes](../external/overlay-custom-classes) - CSS classes affected by `cornerRadius` / `scoreStyle`
