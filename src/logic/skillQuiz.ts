export interface SkillQuizOption {
  label: string;
  points: number;
}

export interface SkillQuizQuestion {
  id: string;
  question: string;
  options: SkillQuizOption[];
}

export const skillQuizQuestions: SkillQuizQuestion[] = [
  {
    id: 'experience',
    question: 'How long have you been playing squash?',
    options: [
      { label: 'Brand new to squash', points: 0 },
      { label: 'A few months, still learning the basics', points: 1 },
      { label: '1-3 years, comfortable on court', points: 2 },
      { label: '3+ years playing regularly', points: 3 },
    ],
  },
  {
    id: 'rally',
    question: 'How would you describe your rallies?',
    options: [
      { label: 'They break down after a few shots', points: 0 },
      { label: 'I can sustain 5-10 shot rallies', points: 1 },
      { label: 'I can control the pace and length of a rally', points: 2 },
      { label: 'I can dictate rallies and construct points tactically', points: 3 },
    ],
  },
  {
    id: 'matches',
    question: "What's your match experience?",
    options: [
      { label: "I don't really keep score, just hit around", points: 0 },
      { label: 'Friendly matches with people I know', points: 1 },
      { label: 'I play in a club ladder or local league', points: 2 },
      { label: 'I compete in county/regional tournaments', points: 3 },
    ],
  },
  {
    id: 'shots',
    question: 'How would you describe your shot range?',
    options: [
      { label: 'Mostly forehand/backhand drives', points: 0 },
      { label: 'Drives plus basic drop shots', points: 1 },
      { label: 'Drives, drops, boasts and lobs with decent placement', points: 2 },
      { label: 'Full shot range — I can improvise and vary tactically', points: 3 },
    ],
  },
];

const MAX_POINTS_PER_QUESTION = 3;
const MIN_SKILL = 1;
const MAX_SKILL = 5;

export function computeSkillLevel(answers: number[]): number {
  const maxTotal = skillQuizQuestions.length * MAX_POINTS_PER_QUESTION;
  const total = answers.reduce((sum, points) => sum + points, 0);
  const fraction = maxTotal === 0 ? 0 : total / maxTotal;
  const raw = MIN_SKILL + fraction * (MAX_SKILL - MIN_SKILL);
  return Math.round(raw * 2) / 2;
}
