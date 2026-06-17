import { useCallback, useMemo } from 'react'
import dayjs from 'dayjs'
import { slotIndexToIso } from 'helpers/calendarSlotUtils'
import { rowFreeIntervals, TimeInterval } from 'helpers/calendarDayOverlaps'

interface SlotInterval {
  start_at: string
  end_at: string
}

/**
 * Returns memoized slot-state checkers for a single calendar row.
 *
 * @param date
 * @param dayStartHour
 * @param bookedSlots  Slots that block the row (bookings, external, vacation…)
 * @param availableSlots  When provided, enables isSlotFullyBooked (no vendor available),
 *                        isSlotFullyAvailable and freeIntervals (the row's truly free
 *                        time: availability minus busy slots).
 *                        When omitted, isSlotFullyBooked always returns false,
 *                        isSlotFullyAvailable always returns true.
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

  const freeIntervals = useMemo<TimeInterval[] | undefined>(
    () =>
      availableSlots
        ? rowFreeIntervals(availableSlots, bookedSlots)
        : undefined,
    [availableSlots, bookedSlots]
  )

  const isSlotFullyAvailable = useCallback(
    (slotIndex: number): boolean => {
      if (!freeIntervals) return true
      const slotStart = new Date(
        slotIndexToIso(slotIndex, date, dayStartHour)
      ).getTime()
      const slotEnd = new Date(
        slotIndexToIso(slotIndex + 1, date, dayStartHour)
      ).getTime()
      return freeIntervals.some(
        (f) =>
          new Date(f.start_at).getTime() <= slotStart &&
          new Date(f.end_at).getTime() >= slotEnd
      )
    },
    [freeIntervals, date, dayStartHour]
  )

  return { isSlotBooked, isSlotFullyBooked, isSlotFullyAvailable, freeIntervals }
}
