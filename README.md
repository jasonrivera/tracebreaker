# Tracebreaker

Tracebreaker is a mobile-first hacking/heist arcade game built with React, TypeScript, Vite, and HTML Canvas. The player races a countdown trace, taps the matching symbol, and pushes deeper through harder security layers.

## Game Concept

- **Breach Run:** Endless run mode. Clear layers until the trace catches you.
- **Final Vault:** Fixed 100-layer advanced challenge with a victory screen.
- **Daily Breach:** Date-seeded challenge with locally saved daily bests.

The active playfield is rendered on Canvas for fast pointer handling and visual effects. Menus, HUD, settings, themes, and stores are React/DOM for accessibility and easy future mobile wrapping.

## Tech Stack

- React + TypeScript
- Vite
- HTML Canvas
- Plain CSS
- LocalStorage
- Web Audio API
- Browser vibration API
- Minimal PWA manifest and service worker

## Setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Test on a Phone

Run the dev server on your network:

```bash
npm run dev
```

Vite is configured with `--host 0.0.0.0`. Open the Network URL from the same Wi-Fi network on iPhone Safari or Android Chrome.

## Production Build

```bash
npm run build
npm run preview
```

## PWA Notes

The app includes:

- `public/manifest.webmanifest`
- Placeholder SVG icons
- Mobile viewport metadata
- A small production-only service worker

The service worker caches the shell only. Expand it carefully if you add remote assets or heavier content.

## Capacitor Wrapping Notes

Capacitor is not installed yet. To wrap later:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init Tracebreaker com.example.tracebreaker
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

For iOS, open the generated iOS project in Xcode after `npx cap open ios`. For Android, open Android Studio after `npx cap open android`.

## Monetization Placeholders

- Rewarded continue: `GameOverScreen.tsx` simulates a 3-second rewarded ad flow before resuming once per run.
- Remove Ads: Settings includes a disabled “Coming Soon” button.
- Credit packs and in-app purchases: keep future purchase hooks near profile credit updates and the themes/upgrades screens.
- Cosmetic themes currently use local in-game credits only.

## Future Improvements

- Add more symbol families and mode modifiers.
- Add real PWA offline update prompts.
- Add leaderboard or cloud sync.
- Add tutorial variants for memory-target levels.
- Add optional rewarded ads and premium cosmetic packs after Capacitor integration.
