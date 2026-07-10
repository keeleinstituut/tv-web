import { RefObject, useLayoutEffect, useState } from 'react'

/**
 * Measures the container width on mount and on resize, returning a fluid
 * column/slot width that fills the available space.
 *
 * @param containerRef  Ref attached to the scrolling container element.
 * @param labelWidth    Width of the fixed left label column (px).
 * @param numUnits      Number of equal columns to divide the remaining space into.
 * @param minWidth      Minimum width per unit (px) — returned when container is too narrow.
 * @param extraOffset   Any additional fixed offset to subtract (e.g. a right corner cell).
 */
export function useResponsiveCalendarWidth(
  containerRef: RefObject<HTMLElement | null>,
  labelWidth: number,
  numUnits: number,
  minWidth: number,
  extraOffset = 0
): number {
  const [width, setWidth] = useState(minWidth)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const available = el.clientWidth - labelWidth - extraOffset
      setWidth(Math.max(minWidth, Math.floor(available / numUnits)))
    }
    measure()
    const obs = new ResizeObserver(measure)
    obs.observe(el)
    return () => obs.disconnect()
  // numUnits can change (e.g. month view when weeks.length changes)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numUnits])

  return width
}
