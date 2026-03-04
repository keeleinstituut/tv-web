/** Fixed widths to align time row and grid (Figma). */
export const LAYOUT_LEFT_WIDTH_PX = 64
export const LAYOUT_CENTER_WIDTH_PX = 1120
export const LAYOUT_RIGHT_WIDTH_PX = 48
export const LAYOUT_TOTAL_WIDTH_PX =
  LAYOUT_LEFT_WIDTH_PX + LAYOUT_CENTER_WIDTH_PX + LAYOUT_RIGHT_WIDTH_PX

/** Day view: column count and slot width depend on 30 vs 60 min step. */
export type SlotStepMinutes = 30 | 60

export function getSlotColumnCount(stepMinutes: SlotStepMinutes): number {
  return stepMinutes === 60 ? 13 : 25 // 09, 09:30, …, 21
}

export function getSlotWidthPx(stepMinutes: SlotStepMinutes): number {
  return LAYOUT_CENTER_WIDTH_PX / getSlotColumnCount(stepMinutes)
}

/** @deprecated Use getSlotWidthPx(60) for 1h slots. */
export const SLOT_WIDTH_PX = LAYOUT_CENTER_WIDTH_PX / 13
