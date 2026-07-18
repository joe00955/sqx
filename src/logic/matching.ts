import { Court, Player, TimeSlot } from '../data/types';

export interface SuggestedBooking {
  day: TimeSlot['day'];
  start: string;
  end: string;
  court: Court;
}

export interface MatchResult {
  player: Player;
  score: number; // 0-100
  skillDiff: number;
  suggestedBookings: SuggestedBooking[];
}

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const overlapWindow = (a: TimeSlot, b: TimeSlot): TimeSlot | null => {
  if (a.day !== b.day) return null;
  const start = Math.max(toMinutes(a.start), toMinutes(b.start));
  const end = Math.min(toMinutes(a.end), toMinutes(b.end));
  if (start >= end) return null;
  const fmt = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  return { day: a.day, start: fmt(start), end: fmt(end) };
};

const findCourtFor = (window: TimeSlot, courts: Court[]): Court | null => {
  const sorted = [...courts].sort((a, b) => a.distanceKm - b.distanceKm);
  for (const court of sorted) {
    const fits = court.bookableSlots.some(
      (bookable) =>
        bookable.day === window.day &&
        toMinutes(bookable.start) <= toMinutes(window.start) &&
        toMinutes(bookable.end) >= toMinutes(window.end)
    );
    if (fits) return court;
  }
  return null;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function findMatches(currentUser: Player, candidates: Player[], courts: Court[]): MatchResult[] {
  const results = candidates.map((player) => {
    const overlaps: TimeSlot[] = [];
    for (const mySlot of currentUser.availability) {
      for (const theirSlot of player.availability) {
        const window = overlapWindow(mySlot, theirSlot);
        if (window) overlaps.push(window);
      }
    }

    const suggestedBookings: SuggestedBooking[] = overlaps
      .map((window) => {
        const court = findCourtFor(window, courts);
        return court ? { ...window, court } : null;
      })
      .filter((booking): booking is SuggestedBooking => booking !== null);

    const skillDiff = Math.abs(currentUser.skillLevel - player.skillLevel);
    const skillScore = clamp01(1 - skillDiff / 4);
    const distanceScore = clamp01(1 - player.distanceKm / 15);
    const availabilityScore = clamp01(overlaps.length / 3);
    const bookingBonus = suggestedBookings.length > 0 ? 0.1 : 0;

    const score = Math.round(
      clamp01(skillScore * 0.4 + distanceScore * 0.3 + availabilityScore * 0.2 + bookingBonus) * 100
    );

    return { player, score, skillDiff, suggestedBookings };
  });

  return results.sort((a, b) => b.score - a.score);
}
