import dayjs from 'dayjs'
import type { SidePanelSelection } from 'components/contexts/CalendarContext'
import type { BookedSlot, CalendarLanguage } from 'types/calendar'

export function intervalsOverlapIso(
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

export function slotsForLanguageFromDay(
  languageId: string,
  dayData: { booked_slots_by_language?: Record<string, BookedSlot[]> } | undefined
): BookedSlot[] {
  if (!dayData?.booked_slots_by_language) return []
  return dayData.booked_slots_by_language[languageId] ?? []
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
