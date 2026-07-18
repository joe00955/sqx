export function skillLabelFor(level: number): string {
  if (level < 2) return 'Beginner';
  if (level < 3) return 'Improver';
  if (level < 4) return 'Intermediate';
  if (level < 4.5) return 'Advanced';
  return 'Pro';
}
