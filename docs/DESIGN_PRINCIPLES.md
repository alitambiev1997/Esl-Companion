# Design principles (all screens, all activity types)

## Layout
1. One task per screen.
2. Content scrolls; actions in a fixed bottom bar above safe area.
3. Max two columns for tappable things; option lists are single-column full-width cards.
4. Tap targets >= 56; spacing rhythm 12 / 16 / 24.
5. No mid-word wrapping on chips (2 lines + font shrink max).

## Components
6. OptionCard for selectable answers.
7. Chip for banks, pairs, short options.
8. SpeakerButton + SlowButton for all audio.
9. FeedbackBanner for all results; Continue lives in the banner.
10. Top bar = X (leave confirm) + animated progress bar. No "Exercise x of y" text.

## Interaction
11. Tap-only. No drag gestures.
12. Shuffle once, store; never reshuffle on render.
13. Distractors exclude the target; options value-unique.
14. Removed items keep their space (opacity 0), no reflow.

## Feel
15. 3D bottom border + press scale 0.97.
16. The board reacts: correct pops leaf, wrong shakes coral.
17. Animations 300-750 ms - for learners, not for demos.
18. Animated API only; tokens only.

## Product rules
19. No XP, hearts, leagues. Medals (bronze 60 / silver 80 / gold 90 / platinum 100) + streaks.
20. No self-grading; the app checks objectively.
21. Every answer has a source of truth: audio contains the fact, or grammar distinguishes options. Never arbitrary facts.
22. No new packages without explicit approval.

## New activity checklist
- [ ] shape in docs/EXERCISE_SHAPES.md
- [ ] 2 samples in src/dev/sampleExercises.ts
- [ ] on /testing, grouped, mini-lesson flow works
- [ ] shared components only
- [ ] onResult callback, no DB writes in renderers
- [ ] is_required respected; scoring feeds medals
- [ ] verified on device