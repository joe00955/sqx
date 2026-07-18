export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface TimeSlot {
  day: Day;
  start: string; // 24h "HH:mm"
  end: string; // 24h "HH:mm"
}

export interface Court {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  bookableSlots: TimeSlot[];
}

export interface Player {
  id: string;
  name: string;
  initials: string;
  skillLevel: number; // 1 (beginner) - 5 (pro)
  skillLabel: string;
  bio: string;
  homeCourtId: string;
  distanceKm: number; // distance from current user
  availability: TimeSlot[];
}
