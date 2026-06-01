---
id: obs-overlay-setup
title: OBS Overlay Setup
sidebar_label: OBS Overlay Setup
---

## Quick Links
- [Discord](https://discord.gg/8C46dpTeqR)
- [OBS](https://obsproject.com/)
- [Nowplaying.site](https://nowplaying.site/)

## Where to find the overlay?

1. Go to your Tournament
2. Click **Manage** in the top right corner
3. Click **Overlay Dashboard** in the same right corner

:::note
If you're not a tournament admin or organizer, you won't see the **Overlay Dashboard** button. Access the dashboard directly at `https://compsaber.com/overlay/dashboard` and enter a tournament API key.

Ask a tournament admin or organizer for the API key from their overlay dashboard.
:::

Everything you need is in the **right** sidebar.

You have two options:
- Set up sources yourself
- Use the provided OBS scene-collection (1440p or 1080p)

Self-setup assumes technical knowledge. Help is always available in `#streaming-support` on the CompSaber Discord.

## Prerequisites for OBS

Before importing the scene-collection:

1. Click `File` → `Settings`
2. Click `Output` → `Streaming` tab → set **Rescale Output** to `disabled` → click **OK**
3. Click `Video`:
   - Set **Base (Canvas) Resolution** to `2560x1440` or `1920x1080`
   - If using 1440p, recommended downscale to `1920x1080` for streaming
   - Set **Downscale Filter** to `Bicubic` or `Lanczos`
4. Click **Apply**

## Setting up the overlay

1. In OBS: `Scene Collection` → `Import`
2. Click **Browse** and select your downloaded scene-collection
3. Confirm you see `CompSaber OBS XXXXp Overlay` with the file path + OBS as the detected application
4. Click **Import**
5. Switch to it via `Scene Collection` → `CompSaber OBS XXXXp Overlay`

## How to adjust sound?

In the `Intermission` scene you'll see two audio sources:

| Source | What to set it to |
|---|---|
| `Stream Music` | Your music source (e.g. Spotify) |
| `Caster Audio` | Your caster audio source |

## How to adjust the song overlay?

The default song overlay uses [nowplaying.site](https://nowplaying.site/).

1. Sign up and connect your streaming service
2. Change the widget design to **Modern**
3. Copy the widget URL
4. In OBS, find `Music Player` and `Music Player P&B` sources
5. Edit both and replace the URL with your widget URL

## How to use own background?

Replace the background source in the relevant scenes with your own image or video source.

## Notes from Hawk

- Use the BeatGacha OBS stinger if you want animated scene transitions
- Make sure your stream resolution and canvas resolution match before going live
