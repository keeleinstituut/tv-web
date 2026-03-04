/**
 * Calendar slot/block status for day grid (Teostaja view).
 * Matches business logic: empty, past booked, current/upcoming booked, bookable, occupied.
 */
export type CalendarSlotStatus =
  | 'empty'
  | 'past_booked'
  | 'booked'
  | 'bookable'
  | 'occupied'

/**
 * A continuous block of time in a row (e.g. 15:00–16:00 booked "1h").
 * Hours are 0–24, startHour is inclusive, endHour is exclusive.
 */
export interface CalendarBlock {
  startHour: number
  endHour: number
  status: CalendarSlotStatus
  /** e.g. "1h", "3h" for booked */
  durationLabel?: string
}

/**
 * One row in the day grid: a language (or "Välja") and its time blocks.
 */
export interface CalendarLanguageRow {
  languageCode: string
  blocks: CalendarBlock[]
}

/** Working hours: 9–21 for day view. */
export const DAY_VIEW_START_HOUR = 9
export const DAY_VIEW_END_HOUR = 21

/** Slot granularity: 30 or 60 minutes (plan: "0.5 h steps"). */
export type SlotStepMinutes = 30 | 60

/** Number of slot columns for day view (9–21). 60 → 13, 30 → 25 (09:00 … 21:00). */
export function getDayViewSlotCount(stepMinutes: SlotStepMinutes): number {
  const hours = DAY_VIEW_END_HOUR - DAY_VIEW_START_HOUR
  return stepMinutes === 60 ? hours + 1 : hours * 2 + 1
}
