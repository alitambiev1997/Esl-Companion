export type OnboardingLocale = 'en' | 'cs';

export const languageStepCopy = {
  titleLine1: 'Choose your language',
  titleLine2: 'Vyberte svůj jazyk',
} as const;

export const goalKeys = ['general', 'work', 'travel', 'exams'] as const;
export type GoalKey = (typeof goalKeys)[number];

export interface LevelCopy {
  title: string;
  description: string;
}

export const onboardingCopy = {
  en: {
    titleGoal: "What's your goal?",
    goals: {
      general: 'General English',
      work: 'Work',
      travel: 'Travel',
      exams: 'Exam preparation',
    },
    titleLevel: 'Choose your level',
    continue: 'Continue',
    back: 'Back',
    finish: 'Finish',
  },
  cs: {
    titleGoal: 'Jaký je váš cíl?',
    goals: {
      general: 'Obecná angličtina',
      work: 'Angličtina do práce',
      travel: 'Angličtina na cesty',
      exams: 'Příprava na zkoušky',
    },
    titleLevel: 'Vyberte svou úroveň',
    continue: 'Pokračovat',
    back: 'Zpět',
    finish: 'Dokončit',
  },
} as const;

export const levelCopyByCefr: Record<OnboardingLocale, Record<string, LevelCopy>> = {
  en: {},
  cs: {
    A1: { title: 'Začátečník', description: 'První slovíčka a jednoduché věty.' },
    A2: { title: 'Mírně pokročilý', description: 'Každodenní situace a cestování.' },
    B1: { title: 'Středně pokročilý', description: 'Plynulejší konverzace a složitější témata.' },
    B2: { title: 'Pokročilý', description: 'Jistá komunikace v práci i ve studiu.' },
  },
};

export function getOnboardingCopy(locale: OnboardingLocale) {
  return onboardingCopy[locale];
}