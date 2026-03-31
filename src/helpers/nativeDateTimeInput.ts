import type { MouseEvent } from 'react'

/** Opens the browser picker for date/time inputs when supported (Chrome, Safari, Edge). */
export function openNativeDateTimePicker(
  e: MouseEvent<HTMLInputElement>
): void {
  const el = e.currentTarget
  if (
    el.type !== 'date' &&
    el.type !== 'time' &&
    el.type !== 'datetime-local'
  ) {
    return
  }
  if (typeof el.showPicker !== 'function') return
  try {
    void el.showPicker()
  } catch {
    // Not allowed or unsupported in this browser
  }
}
