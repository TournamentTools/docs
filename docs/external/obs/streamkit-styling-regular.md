---
id: streamkit-styling-regular
title: StreamKit Styling (Regular)
sidebar_label: StreamKit CSS (Regular)
sidebar_position: 4
---

Custom CSS for Discord's [StreamKit voice overlay](https://streamkit.discord.com/overlay) on match screens.

## StreamKit URL template

```
https://streamkit.discord.com/overlay/voice/SERVER_ID/VOICE_CHAT_ID?icon=true&online=true&logo=white&text_color=%23ffffff&text_size=20&text_outline_color=%23000000&text_outline_size=0&text_shadow_color=%23000000&text_shadow_size=0&bg_color=%231e2124&bg_opacity=0&bg_shadow_color=%23000000&bg_shadow_size=0&invite_code=&limit_speaking=false&small_avatars=false&hide_names=false&fade_chat=0&streamer_avatar_first=true
```

Replace `SERVER_ID` and `VOICE_CHAT_ID` with your server and voice channel IDs.

## Custom CSS

Add this in OBS Browser Source → **Custom CSS**:

```css
/**
* Custom StreamKit-style by hawk_bs @ CompSaber
* 
* (C) StreamKit, Discord, 2026
*/

@font-face {
    font-family: "SF Pro Text";
    src: url("https://db.onlinewebfonts.com/t/116f64f66c1cfef86f6eb0c37b61b43b.woff2")format("woff2"),
        url("https://db.onlinewebfonts.com/t/116f64f66c1cfef86f6eb0c37b61b43b.woff")format("woff");
}

* {
    font-family: "SF Pro Text" !important;
    font-weight: 500 !important;
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: transparent;
    transform: scale(2.4);
    transform-origin: top left;
}

/* Outer container */
.voice_container {
    padding: 12px !important;
    margin: 0 !important;
    background: transparent !important;
}

/* Row of avatars */
.voice_states {
    list-style: none !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    flex-direction: row !important;
    gap: 24px !important;
    align-items: flex-start !important;
}

/* Each caster - vertical stack: avatar + name */
.voice_state {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    opacity: 0.5;
    transition: opacity 150ms ease-in-out !important;
}

.wrapper_speaking {
    opacity: 1 !important;
}

/* Avatar - circular with border */
.voice_avatar {
    display: block !important;
    width: 72px !important;
    height: 72px !important;
    border-radius: 50% !important;
    border: 3px solid rgba(255, 255, 255, 0.25) !important;
    object-fit: cover !important;
    transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out !important;
}

/* Speaking ring glow */
.wrapper_speaking .voice_avatar {
    border-color: #3ba55c !important;
    box-shadow: 0 0 0 3px rgba(59, 165, 92, 0.35), 0 0 16px rgba(59, 165, 92, 0.4) !important;
}

/* Muted - red ring */
.self_mute .voice_avatar {
    border-color: rgba(255, 58, 58, 0.7) !important;
    box-shadow: none !important;
}

/* Name wrapper - must not clip */
.voice_username,
div[class*="Voice_user"] {
    margin: 0 !important;
    padding: 0 !important;
    text-align: center !important;
    width: 80px !important;
    max-width: 80px !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    display: block !important;
}

/* Name span - inline style has color/font-size/bg, need !important on all */
span[class*="Voice_name"] {
    font-size: 14px !important;
    color: rgb(255, 255, 255) !important;
    background-color: transparent !important;
    line-height: 1.3 !important;
    display: block !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    width: 80px !important;
    max-width: 80px !important;
    height: auto !important;
    visibility: visible !important;
    opacity: 1 !important;
}

/* Hide mic pseudo-element */
.voice_state::before {
    display: none !important;
    content: none !important;
}
```
