# Design principles (all screens, all activity types)

Source of truth for UI/UX. Work that violates these is wrong even if it compiles.

## Layout
1. One task per screen. Everything else stays out.
2. Content scrolls; actions live in a fixed bottom bar above the safe area.
3. Max two columns for anything tappable; option lists are single-column full-width cards.
4. Tap targets >= 56 height; spacing rhythm 12 / 16 / 24.
5. No mid-word wrapping on chips/pills (2 lines + font shrink max).

## Components (use these, never re-invent)
6. OptionCard for selectable answers.
7. Chip for word banks and pairs.
8. SpeakerButton + SlowButton for all audio.
9. FeedbackBanner for all results (leaf = correct, coral = wrong); Continue lives inside the banner.
10. Top bar = X (with leave confirm) + animated progress bar. No "Exercise x of y" text.

## Feel
11. Buttons have the 3D bottom border + press scale 0.97.
12. The board reacts: correct pops/fades leaf, wrong shakes coral.
13. No reflow jumps: removed items keep their space (opacity 0).
14. Animated API only; no animation packages.
15. Tokens only. No raw hex outside src/theme.

## What we never do
16. No XP, no hearts/lives, no leagues. Medals + streaks only.
17. No self-grading. The app always checks objectively.
18. No new packages without explicit approval.

## New activity type checklist
- [ ] content shape documented in docs/EXERCISE_SHAPES.md
- [ ] two samples added to src/dev/sampleExercises.ts
- [ ] appears on /testing, grouped, mini-lesson flow works
- [ ] uses only the shared components above
- [ ] results via onResult callback (no DB writes in renderers)
- [ ] is_required respected; scoring feeds medal logic
- [ ] verified on device: testing page + real lesson