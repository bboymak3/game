
---
Task ID: 1
Agent: Main
Task: Fix Android compatibility - game loads on PC but gets stuck on Android

Work Log:
- Read all project files: page.tsx, GameEngine.tsx (1369 lines), types.ts, PixelSprites.ts, layout.tsx, globals.css, manifest.json, next.config.ts
- Identified 5 Android compatibility issues:
  1. `100dvh` CSS unit not supported on many Android browsers → container has 0 height
  2. `autoPlay` attribute on video element causes silent errors on Android
  3. `display: "fullscreen"` in manifest.json causes issues on some Android devices
  4. `onTouchStart` with `preventDefault()` blocks touch interactions on Android
  5. No error handling / loading timeout for slow mobile connections
- Applied fixes:
  - globals.css: Added `100vh` fallback before `100dvh`, added `@supports not (height: 100dvh)` fallback with `-webkit-fill-available`
  - GameEngine.tsx: Changed container from `height: '100dvh'` to `height: '100vh', maxHeight: '100dvh'`
  - GameEngine.tsx: Removed `autoPlay` from video element (play() is called programmatically)
  - manifest.json: Changed `display: "fullscreen"` to `display: "standalone"`, updated name
  - layout.tsx: Added `viewportFit: "cover"` for notched phones
  - GameEngine.tsx: Changed `onTouchStart` with `preventDefault` to `onTouchEnd` without preventDefault
  - GameEngine.tsx: Updated handleTap to use `changedTouches` for touchEnd compatibility
  - page.tsx: Added loading state with setTimeout, error boundary with retry button
- Verified build succeeds

Stage Summary:
- All Android compatibility fixes applied and build passes
- Key fixes: dvh fallback, removed autoPlay, touch event handling, manifest display mode
