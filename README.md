# Tracebreaker

Tracebreaker is a mobile-first hacking/heist arcade game built with React, TypeScript, Vite, and HTML Canvas. The player memorizes a target symbol, taps the matching symbol in the grid, and tries to break deeper layers before the countdown hits zero.

The app is built as a web game first so it can be tested in mobile browsers now and wrapped with Capacitor later.

## Game Modes

- **Breach Run:** Main arcade mode. Clear as many layers as possible and chase your best rank.
- **Final Vault:** Advanced 100-layer challenge. Starts harder than Breach Run, ramps faster, and awards a large completion bonus when cleared.
- **Daily Breach:** Date-seeded challenge. Today’s pattern is reused for the day and saves “Today’s Best” locally.

## Tech Stack

- React + TypeScript
- Vite
- HTML Canvas for active gameplay
- Plain CSS
- LocalStorage for profile/settings/progression
- Web Audio API for SFX and background music
- Browser vibration API for haptics
- PWA manifest + minimal service worker

## Local Setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173/
```

## Mobile Testing

Run the dev server on your local network:

```bash
npm run dev
```

Vite is configured with `--host 0.0.0.0`, so it prints a Network URL such as:

```text
http://192.168.x.x:5173/
```

Use the Network URL on devices connected to the same Wi-Fi:

- iPhone Safari
- Android Chrome
- iPad/tablet browsers
- Desktop Chrome/Safari/Firefox

Mobile checks to perform:

- Add to Home Screen and launch standalone.
- Rotate the device, then return to portrait.
- Tap near cell edges to confirm canvas touch accuracy.
- Toggle Sound, Haptics, Screen Effects, and Reduced Motion.
- Background the browser and return to the game.

## Production Build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## PWA Setup

Included:

- `public/manifest.webmanifest`
- `public/sw.js`
- Placeholder SVG icons at `public/icons/icon-192.svg` and `public/icons/icon-512.svg`
- Mobile viewport metadata
- Apple mobile web app metadata
- Theme/background colors

The service worker intentionally caches only the app shell. Expand it carefully if larger assets are added.

## Testing Tools

Settings includes local QA tools:

- Reset Best Score
- Reset Credits

The following tester-only tools are hidden by default in public builds:

- Reset Daily Breach
- Add 500 Test Credits
- Reset All Local Data
- Remove Ads: Coming Soon

To show tester-only tools on your device, open DevTools or the browser console and run:

```js
localStorage.setItem("tracebreaker.devTools", "true");
location.reload();
```

To hide them again:

```js
localStorage.removeItem("tracebreaker.devTools");
location.reload();
```

Saved data lives in LocalStorage under:

```text
tracebreaker.profile.v1
```

The storage loader handles corrupted data by falling back to defaults.

## QA Checklist

Core flow:

- Home loads without console errors.
- Start Breach begins a run immediately.
- Timer counts down from 30 seconds in Breach Run.
- Target and grid symbols stay static during each round.
- Correct tap advances to the next layer.
- Wrong tap shows failure feedback and opens Game Over.
- Restart Breach starts a fresh run quickly.

Modes:

- Final Vault briefing appears before play.
- Final Vault HUD shows `Layer X/100`.
- Final Vault completes with `VAULT BREACHED` after layer 100.
- Daily Breach briefing explains today’s seed.
- Daily Breach saves today’s best layer locally.

Progression:

- Credits are awarded on Game Over.
- Daily Breach adds the daily credit bonus.
- Final Vault completion adds the vault bonus.
- Themes can be bought with credits and selected.
- Upgrades can be bought with credits.
- Rank guide opens from Home.
- Credits guide opens from Home.

Settings:

- Sound toggle disables SFX and music.
- Haptics toggle disables vibration calls.
- Screen Effects toggle reduces visual overlays.
- Reduced Motion removes motion-heavy effects.
- Reset tools update LocalStorage as expected.

Mobile/browser:

- Canvas is crisp on high-DPI screens.
- Touch input maps accurately to canvas cells.
- Layout fits small phones without horizontal scrolling.
- Safe areas work on iPhone Safari.

## Capacitor Notes

Capacitor is not installed yet. When ready:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init Tracebreaker com.example.tracebreaker
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

Then:

```bash
npx cap open ios
npx cap open android
```

Recommended future native work:

- Replace placeholder icons with production PNG icon sets.
- Add splash screens.
- Test safe areas on real iOS/Android hardware.
- Confirm audio unlock behavior inside Capacitor WebView.
- Add native haptics through Capacitor only if browser vibration is insufficient.

## Rewarded Ads Placeholder

No real ads or payments are integrated.

Current placeholders:

- Game Over has `Jam Trace and Continue: Coming Soon`.
- Settings has `Remove Ads: Coming Soon` hidden behind the local dev-tools flag.
- Credit packs are not implemented.

Future rewarded ad integration points:

- `src/screens/GameOverScreen.tsx` for continue UI.
- `src/App.tsx` for resuming or restarting run state after reward.
- Profile credit updates near `persistRun` if ad rewards ever grant credits.

When integrating real ads later:

- Require explicit reward callbacks before granting continues.
- Keep one continue per run unless the design changes.
- Add failure/cancel states.
- Respect platform privacy and consent requirements.
- Keep purchases/currency server-validated if real money is involved.
