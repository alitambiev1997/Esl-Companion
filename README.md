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

## Web build

```bash
npx expo export --platform web   # outputs dist/
```

Deploy `dist/` to any static host (Netlify, Vercel). The `public/_redirects` file provides the SPA fallback so deep links work.

## Web practice site

A no-account version of the course for classroom use. Open the URL, enter a class code, and play the same lessons as the app.

- Live: <URL> (pending first deploy)
- Class codes: `AQAP-A2` (CEFR A2)

It deliberately lacks: accounts/sign-in, review (SRS) sessions, progress tracking (progress lives only in the browser's localStorage), and any server-side writes. Lesson attempts and scores are computed and stored locally per browser; nothing is uploaded.