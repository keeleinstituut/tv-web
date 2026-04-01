import { useCallback } from 'react'
import dayjs from 'dayjs'
import { slotIndexToIso } from 'helpers/calendarSlotUtils'

interface SlotInterval {
  start_at: string
  end_at: string
}

/**
 * Returns memoized slot-state checkers for a single calendar row.
 *
 * @param bookedSlots  Slots that block the row (bookings, external, vacation…)
 * @param availableSlots  When provided, enables isSlotFullyBooked (no vendor available).
 *                        When omitted, isSlotFullyBooked always returns false.
 */
export function useSlotStateCheckers(
  date: string,
  dayStartHour: number,
  bookedSlots: SlotInterval[],
  availableSlots?: SlotInterval[]
) {
  const isSlotBooked = useCallback(
    (slotIndex: number): boolean => {
      const slotStart = slotIndexToIso(slotIndex, date, dayStartHour)
      const slotEnd = slotIndexToIso(slotIndex + 1, date, dayStartHour)
      return bookedSlots.some(
        (s) =>
          dayjs(s.start_at).isBefore(dayjs(slotEnd)) &&
          dayjs(s.end_at).isAfter(dayjs(slotStart))
      )
    },
    [bookedSlots, date, dayStartHour]
  )

  const isSlotFullyBooked = useCallback(
    (slotIndex: number): boolean => {
      if (!availableSlots) return false
      const slotStart = dayjs(slotIndexToIso(slotIndex, date, dayStartHour))
      const slotEnd = dayjs(slotIndexToIso(slotIndex + 1, date, dayStartHour))
      return !availableSlots.some(
        (a) =>
          dayjs(a.start_at).isBefore(slotEnd) &&
          dayjs(a.end_at).isAfter(slotStart)
      )
    },
    [availableSlots, date, dayStartHour]
  )

  return { isSlotBooked, isSlotFullyBooked }
}
