import { computeSkillLevel, skillQuizQuestions } from '../skillQuiz';

describe('computeSkillLevel', () => {
  it('maps all-zero answers to the minimum skill level', () => {
    const answers = skillQuizQuestions.map(() => 0);
    expect(computeSkillLevel(answers)).toBe(1);
  });

  it('maps max-points answers to the maximum skill level', () => {
    const answers = skillQuizQuestions.map(() => 3);
    expect(computeSkillLevel(answers)).toBe(5);
  });

  it('maps mid-range answers to the middle of the scale', () => {
    const answers = skillQuizQuestions.map(() => 1.5);
    expect(computeSkillLevel(answers)).toBe(3);
  });

  it('rounds to the nearest 0.5', () => {
    const answers = [3, 2, 1, 0];
    const level = computeSkillLevel(answers);
    expect(level * 2).toBe(Math.round(level * 2));
  });
});
