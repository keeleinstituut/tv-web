import dayjs from 'dayjs'
import type { BookedSlot, WeekSlot } from 'types/calendar'

const BLOCK_COUNT = 4

function bookingTimeKey(bk: BookedSlot): string {
  return `${bk.start_at}|${bk.end_at}`
}

/**
 * Maps day slots to a 4-element array of 6h blocks.
 *
 * Vendor path (weekStart provided): overlap-based assignment so bookings that
 * fall in a later local block (e.g. 20:25) are not missed when the API window
 * starts in an earlier UTC block.
 *
 * Translator path (no weekStart): simple hour-based mapping (slot.start_at
 * hour ÷ 6).
 */
export function buildBlockSlots(
  daySlots: WeekSlot[],
  dayIdx: number,
  weekStart: string | undefined
): Array<WeekSlot | undefined> {
  const blockSlots: Array<WeekSlot | undefined> = Array(BLOCK_COUNT).fill(
    undefined
  )

  if (weekStart) {
    const dayStart = dayjs(weekStart).startOf('day').add(dayIdx, 'day')
    for (let b = 0; b < BLOCK_COUNT; b++) {
      const rangeStart = dayStart.add(b * 6, 'hour')
      const rangeEnd = dayStart.add((b + 1) * 6, 'hour')
      const seen = new Set<string>()
      const bookingsInBlock: BookedSlot[] = []
      for (const slot of daySlots) {
        for (const bk of slot.my_bookings ?? []) {
          const key = bookingTimeKey(bk)
          if (seen.has(key)) continue
          const bs = dayjs(bk.start_at)
          const be = dayjs(bk.end_at)
          if (bs.isBefore(rangeEnd) && be.isAfter(rangeStart)) {
            seen.add(key)
            bookingsInBlock.push(bk)
          }
        }
      }
      if (bookingsInBlock.length === 0) continue
      const workingMinutes = bookingsInBlock.reduce(
        (sum, bk) =>
          sum + dayjs(bk.end_at).diff(dayjs(bk.start_at), 'minute'),
        0
      )
      const sourceSlot =
        daySlots.find((s) =>
          (s.my_bookings ?? []).some((bk) =>
            bookingsInBlock.some(
              (x) => bookingTimeKey(x) === bookingTimeKey(bk)
            )
          )
        ) ?? daySlots[0]
      blockSlots[b] = {
        ...sourceSlot,
        start_at: rangeStart.toISOString(),
        end_at: rangeEnd.toISOString(),
        my_bookings: bookingsInBlock,
        my_bookings_count: bookingsInBlock.length,
        working_hours: workingMinutes / 60,
      }
    }
  } else {
    for (const slot of daySlots) {
      const h = dayjs(slot.start_at).hour()
      const idx = Math.floor(h / 6)
      if (idx >= 0 && idx < BLOCK_COUNT) blockSlots[idx] = slot
    }
  }

  return blockSlots
}
