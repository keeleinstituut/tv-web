import dayjs from 'dayjs'
import type { SidePanelSelection } from 'components/contexts/CalendarContext'
import type { BookedSlot, CalendarLanguage } from 'types/calendar'

function intervalsOverlapIso(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return (
    dayjs(aStart).isBefore(dayjs(bEnd)) && dayjs(bStart).isBefore(dayjs(aEnd))
  )
}

/** True if any two slots in the list overlap in time. */
export function bookedSlotsOverlap(slots: BookedSlot[]): boolean {
  const n = slots.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (
        intervalsOverlapIso(
          slots[i].start_at,
          slots[i].end_at,
          slots[j].start_at,
          slots[j].end_at
        )
      ) {
        return true
      }
    }
  }
  return false
}

export function sortBookedSlotsByStart(slots: BookedSlot[]): BookedSlot[] {
  return [...slots].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  )
}

/**
 * Merged time ranges where at least two bookings overlap (for collapsed client day row).
 */
export function mergedOverlapIntervals(
  slots: BookedSlot[]
): Array<{ start_at: string; end_at: string }> {
  if (slots.length < 2) return []
  const boundaries = new Set<number>()
  for (const s of slots) {
    boundaries.add(new Date(s.start_at).getTime())
    boundaries.add(new Date(s.end_at).getTime())
  }
  const sorted = Array.from(boundaries).sort((a, b) => a - b)
  const segments: Array<{ start_at: string; end_at: string }> = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const t0 = sorted[i]
    const t1 = sorted[i + 1]
    if (t0 >= t1) continue
    let count = 0
    for (const s of slots) {
      const s0 = new Date(s.start_at).getTime()
      const s1 = new Date(s.end_at).getTime()
      if (s0 < t1 && s1 > t0) count++
    }
    if (count >= 2) {
      segments.push({
        start_at: new Date(t0).toISOString(),
        end_at: new Date(t1).toISOString(),
      })
    }
  }
  if (!segments.length) return []
  const merged: Array<{ start_at: string; end_at: string }> = []
  let cur = { ...segments[0] }
  for (let i = 1; i < segments.length; i++) {
    const next = segments[i]
    if (new Date(cur.end_at).getTime() === new Date(next.start_at).getTime()) {
      cur = { start_at: cur.start_at, end_at: next.end_at }
    } else {
      merged.push(cur)
      cur = { ...next }
    }
  }
  merged.push(cur)
  return merged
}

export interface TimeInterval {
  start_at: string
  end_at: string
}

interface MsInterval {
  start: number
  end: number
}

const toMs = (i: TimeInterval): MsInterval => ({
  start: new Date(i.start_at).getTime(),
  end: new Date(i.end_at).getTime(),
})

const toIso = (i: MsInterval): TimeInterval => ({
  start_at: new Date(i.start).toISOString(),
  end_at: new Date(i.end).toISOString(),
})

/** Merge overlapping/touching intervals into a sorted disjoint list. */
export function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
  const sorted = intervals
    .map(toMs)
    .filter((i) => i.start < i.end)
    .sort((a, b) => a.start - b.start)
  const merged: MsInterval[] = []
  for (const i of sorted) {
    const last = merged[merged.length - 1]
    if (last && i.start <= last.end) {
      last.end = Math.max(last.end, i.end)
    } else {
      merged.push({ ...i })
    }
  }
  return merged.map(toIso)
}

/** Remove busy time from base intervals. */
export function subtractIntervals(
  base: TimeInterval[],
  busy: TimeInterval[]
): TimeInterval[] {
  const blockers = busy
    .map(toMs)
    .filter((b) => b.start < b.end)
    .sort((a, b) => a.start - b.start)
  const result: MsInterval[] = []
  for (const range of base.map(toMs)) {
    let cursor = range.start
    for (const b of blockers) {
      if (b.end <= cursor || b.start >= range.end) continue
      if (b.start > cursor) result.push({ start: cursor, end: b.start })
      cursor = Math.max(cursor, b.end)
      if (cursor >= range.end) break
    }
    if (cursor < range.end) result.push({ start: cursor, end: range.end })
  }
  return result.map(toIso)
}

/** Pieces of the intervals falling inside [startIso, endIso). */
export function clipIntervals(
  intervals: TimeInterval[],
  startIso: string,
  endIso: string
): TimeInterval[] {
  const winStart = new Date(startIso).getTime()
  const winEnd = new Date(endIso).getTime()
  return intervals
    .map(toMs)
    .map((i) => ({
      start: Math.max(i.start, winStart),
      end: Math.min(i.end, winEnd),
    }))
    .filter((i) => i.start < i.end)
    .map(toIso)
}

/**
 * The row's truly free time: merged availability minus busy slots. The API
 * already excludes committed bookings from availability, so the subtraction
 * only carves out client-side slots it can't know about (e.g. the pending
 * side-panel prebook).
 */
export function rowFreeIntervals(
  availableSlots: TimeInterval[],
  bookedSlots: TimeInterval[]
): TimeInterval[] {
  return subtractIntervals(mergeIntervals(availableSlots), bookedSlots)
}

/**
 * Extend a cell-clipped gap piece to the end of the continuous free stretch
 * it belongs to, keeping the piece's own start. Booking from a gap is then
 * not capped at the 30-min cell boundary (e.g. gap 10:50–11:00 inside stretch
 * 10:50–11:30 extends to 10:50–11:30).
 */
export function extendToStretchEnd(
  piece: TimeInterval,
  freeIntervals: TimeInterval[]
): TimeInterval {
  const pieceStart = new Date(piece.start_at).getTime()
  const stretch = freeIntervals.find(
    (f) =>
      new Date(f.start_at).getTime() <= pieceStart &&
      new Date(f.end_at).getTime() > pieceStart
  )
  return stretch ? { start_at: piece.start_at, end_at: stretch.end_at } : piece
}

/**
 * Valid booking start times inside a free interval. A start must be
 * clock-aligned (minute % stepMin === 0), be >= interval start and leave room
 * for a minimal booking (start + stepMin <= interval end).
 * Empty result = interval is not bookable.
 */
export function validBookingStartsInInterval(
  intervalStartIso: string,
  intervalEndIso: string,
  stepMin = 10
): string[] {
  const start = dayjs(intervalStartIso)
  const end = dayjs(intervalEndIso)
  if (!start.isBefore(end)) return []

  const floored = start
    .startOf('minute')
    .subtract(start.minute() % stepMin, 'minute')
  let mark = floored.isBefore(start) ? floored.add(stepMin, 'minute') : floored

  const starts: string[] = []
  while (!mark.add(stepMin, 'minute').isAfter(end)) {
    starts.push(mark.toISOString())
    mark = mark.add(stepMin, 'minute')
  }
  return starts
}

/**
 * Clamp a cell-based drag selection to the free stretch it falls into.
 * Edges may move within the first/last 30-min cell; start/end snap to stepMin.
 * Null when no single free interval fits or the clamped range is not bookable.
 */
export function clampSelectionToFree(
  selStartIso: string,
  selEndIso: string,
  freeIntervals: TimeInterval[],
  stepMin = 10
): TimeInterval | null {
  const selStart = dayjs(selStartIso)
  const selEnd = dayjs(selEndIso)
  if (!selStart.isBefore(selEnd)) return null

  const selStartLastCellEnd = selStart.add(30, 'minute')
  const selEndFirstCellStart = selEnd.subtract(30, 'minute')

  const stretch = freeIntervals.find((f) => {
    const fStart = dayjs(f.start_at)
    const fEnd = dayjs(f.end_at)
    return (
      fStart.isBefore(selEnd) &&
      fEnd.isAfter(selStart) &&
      !fStart.isAfter(selStartLastCellEnd) &&
      !fEnd.isBefore(selEndFirstCellStart)
    )
  })
  if (!stretch) return null

  const rawStart = selStart.isAfter(dayjs(stretch.start_at))
    ? selStart
    : dayjs(stretch.start_at)
  const rawEnd = selEnd.isBefore(dayjs(stretch.end_at))
    ? selEnd
    : dayjs(stretch.end_at)

  const starts = validBookingStartsInInterval(
    rawStart.toISOString(),
    rawEnd.toISOString(),
    stepMin
  )
  if (!starts.length) return null

  const clampedStart = starts[0]
  const flooredMin = Math.floor(rawEnd.minute() / stepMin) * stepMin
  const clampedEnd = rawEnd.minute(flooredMin).second(0).millisecond(0)

  if (
    !dayjs(clampedStart).isBefore(clampedEnd) ||
    dayjs(clampedStart).add(stepMin, 'minute').isAfter(clampedEnd)
  ) {
    return null
  }

  return { start_at: clampedStart, end_at: clampedEnd.toISOString() }
}

/**
 * Initial booking range when entering create mode from a free interval:
 * first valid clock-aligned start, default 30 min capped at the interval end
 * (floored to a 10-min multiple). Null when the interval is not bookable.
 */
export function defaultBookingRange(
  freeInterval: TimeInterval,
  defaultMin = 30,
  stepMin = 10
): { startIso: string; endIso: string } | null {
  const starts = validBookingStartsInInterval(
    freeInterval.start_at,
    freeInterval.end_at,
    stepMin
  )
  if (!starts.length) return null
  const startIso = starts[0]
  const capMin = dayjs(freeInterval.end_at).diff(dayjs(startIso), 'minute')
  const durationMin = Math.max(
    stepMin,
    Math.min(defaultMin, Math.floor(capMin / stepMin) * stepMin)
  )
  return {
    startIso,
    endIso: dayjs(startIso).add(durationMin, 'minute').toISOString(),
  }
}

export function slotsForLanguageFromDay(
  languageId: string,
  dayData: { booked_slots_by_language?: Record<string, BookedSlot[]> } | undefined
): BookedSlot[] {
  if (!dayData?.booked_slots_by_language) return []
  return dayData.booked_slots_by_language[languageId] ?? []
}

/**
 * Greedy bin-packing: pack sorted slots into the fewest rows possible.
 * Each row contains non-overlapping slots. A new row is created only when
 * a slot overlaps with every existing row.
 */
export function packSlotsIntoRows(sorted: BookedSlot[]): BookedSlot[][] {
  const rows: BookedSlot[][] = []
  const rowEnds: number[] = [] // track latest end time per row
  for (const slot of sorted) {
    const start = new Date(slot.start_at).getTime()
    let placed = false
    for (let r = 0; r < rows.length; r++) {
      if (rowEnds[r] <= start) {
        rows[r].push(slot)
        rowEnds[r] = new Date(slot.end_at).getTime()
        placed = true
        break
      }
    }
    if (!placed) {
      rows.push([slot])
      rowEnds.push(new Date(slot.end_at).getTime())
    }
  }
  return rows
}

export function mergeClientPrebookSlot(
  language: CalendarLanguage,
  rawSlots: BookedSlot[],
  sidePanelSelection: SidePanelSelection | null
): BookedSlot[] {
  const active =
    sidePanelSelection &&
    !sidePanelSelection.slot &&
    sidePanelSelection.language.language.id === language.language.id &&
    sidePanelSelection.startIso &&
    sidePanelSelection.endIso
  if (!active) return rawSlots
  const synthetic: BookedSlot = {
    start_at: sidePanelSelection.startIso,
    end_at: sidePanelSelection.endIso,
    type: 'prebook',
    assignment: null,
  }
  return [...rawSlots, synthetic]
}
