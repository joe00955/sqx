import { TimeSlot } from '../data/types';

export function slotKey(slot: TimeSlot): string {
  return `${slot.day}-${slot.start}-${slot.end}`;
}
