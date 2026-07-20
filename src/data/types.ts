export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

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
  competitiveElo: number;
  casualGamesPlayed: number;
  contactEmail?: string;
  avatarUrl?: string;
  verificationStatus?: VerificationStatus;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  meetupNote: string;
  memberCount: number;
  vibe: 'Casual' | 'Competitive' | 'Mixed';
  memberIds: string[];
}

export type MatchMode = 'casual' | 'competitive';
export type RequestStatus = 'pending' | 'accepted' | 'declined';

export interface IncomingRequest {
  id: string;
  playerId: string;
  mode: MatchMode;
  day: Day;
  start: string;
  end: string;
  courtId: string;
  status: RequestStatus;
}

export interface ChatMessage {
  id: string;
  matchRequestId: string;
  senderId: string;
  body: string;
  createdAt: string;
}
