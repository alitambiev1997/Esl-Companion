# AQAP English

Free ESL companion app for adult learners (MVP phase). Native (Expo/React Native) plus a web practice site gated by class codes.

## Stack

- Expo SDK 54, React Native, TypeScript, Expo Router
- Supabase (Auth, Postgres, Storage)
- TanStack Query-ready architecture, Zustand (light UI state), Zod, React Hook Form

## Run it

```bash
npm install
npx expo start          # native (Expo Go / emulator)
npx expo start --web    # web practice site (dev)
```

Requires a `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

Local web: open `http://localhost:8081/esl-companion/` on the PC; phones on the same Wi-Fi can open `http://<PC-LAN-IP>:8081/esl-companion/`.

## Web build

```bash
npm run deploy:web      # exports dist/ and publishes it to the gh-pages branch
```

The web app is built with a base path (`experiments.baseUrl`), so it works from the GitHub Pages subpath: `https://<org>.github.io/esl-companion/` (enable Pages → branch `gh-pages`). No SPA rewrite file is needed because it ships as a single-page build. Netlify/Vercel with a custom domain is a later option; `public/_redirects` is already in place for that.

## Web practice site

A no-account version of the course for classroom use. Open the URL, enter a class code, and play the same lessons as the app.

- Live: `https://<org>.github.io/esl-companion/` (pending first deploy)
- Class codes: `AQAP-A2` (CEFR A2)

It deliberately lacks: accounts/sign-in, review (SRS) sessions, progress tracking (progress lives only in the browser's localStorage), and any server-side writes. Lesson attempts and scores are computed and stored locally per browser; nothing is uploaded.