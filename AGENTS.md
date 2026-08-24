# ESL Companion App

## Project goal

Free ESL companion app for adult learners. MVP phase.

Do not build monetization, social features, AI conversation tools, or speech scoring.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- Supabase (Auth, Postgres, Storage)
- TanStack Query
- Zustand (light UI state only)
- Zod
- React Hook Form

## Rules for AI coder

1. Work on one ticket only.
2. Do not add packages unless the ticket requires them.
3. Do not change the tech stack.
4. Do not create unrelated features.
5. Do not use Redux, GraphQL, Firebase, or Prisma.
6. Never use the Supabase service_role key.
7. Use only EXPO_PUBLIC_ environment variables in app code.
8. Handle loading, error, empty, and success states.
9. Keep files small and readable.
10. If database changes are needed, show SQL first.
11. If RLS policies are needed, show them.
12. Do not hardcode lesson content.
13. Do not build the admin panel in the mobile app.
14. Ask only if a requirement is blocking.

## Backend state (already done)

- Supabase project connected via .env
- profiles table exists with RLS policies
- Trigger auto-creates a profile on signup
- Email confirmation is OFF for development

## Misc

Onboarding is localized (cs/en) via a small dictionary; the rest of the app stays English for now. No i18n library.

## Mastery medals (no XP)

- Lessons award a medal from the best score: bronze 60-79, silver 80-89, gold 90-99, platinum 100.
- Below 60 = no medal and the lesson is not completed.
- Streaks stay. Reviews grant no currency.
- No XP anywhere in the app or UI.


## Current milestone

Authentication only:

- Login screen
- Signup screen
- Protected home screen
- Sign out

Not in scope: lessons, exercises, vocabulary, teacher dashboard, admin panel.