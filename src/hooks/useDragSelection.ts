import { RefObject, useCallback, useState } from 'react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { slotIndexToIso } from 'helpers/calendarSlotUtils'
import {
  clampSelectionToFree,
  clipIntervals,
  TimeInterval,
} from 'helpers/calendarDayOverlaps'

interface Options {
  rowRef: RefObject<HTMLDivElement>
  date: string
  dayStartHour: number
  totalSlots: number
  slotWidth: number
  isSlotBooked: (slotIndex: number) => boolean
  isSlotFullyBooked?: (slotIndex: number) => boolean
  /** True when the cell is fully covered by free time (used in fallback validation). */
  isSlotFullyAvailable?: (slotIndex: number) => boolean
  /** Row free time (availability minus bookings); enables edge clamping on drag. */
  freeIntervals?: TimeInterval[]
  onDragComplete: (startIso: string, endIso: string) => void
}

export function useDragSelection({
  rowRef,
  date,
  dayStartHour,
  totalSlots,
  slotWidth,
  isSlotBooked,
  isSlotFullyBooked,
  isSlotFullyAvailable,
  freeIntervals,
  onDragComplete,
}: Options) {
  const { t } = useTranslation()
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragEnd, setDragEnd] = useState<number | null>(null)
  const isDragging = dragStart !== null && dragEnd !== null

  const getSlotIndexFromX = useCallback(
    (clientX: number): number | null => {
      const rect = rowRef.current?.getBoundingClientRect()
      if (!rect) return null
      const x = clientX - rect.left
      const index = Math.floor(x / slotWidth)
      return Math.max(0, Math.min(totalSlots - 1, index))
    },
    [rowRef, totalSlots, slotWidth]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const idx = getSlotIndexFromX(e.clientX)
      if (idx === null) return
      const slotIso = slotIndexToIso(idx, date, dayStartHour)
      if (dayjs(slotIso).isBefore(dayjs())) return
      const hasFreePiece =
        !!freeIntervals?.length &&
        clipIntervals(
          freeIntervals,
          slotIso,
          slotIndexToIso(idx + 1, date, dayStartHour)
        ).length > 0
      if (isSlotBooked(idx) && !hasFreePiece) return
      setDragStart(idx)
      setDragEnd(idx)
    },
    [getSlotIndexFromX, date, dayStartHour, isSlotBooked, freeIntervals]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragStart === null) return
      const idx = getSlotIndexFromX(e.clientX)
      if (idx !== null) setDragEnd(idx)
    },
    [dragStart, getSlotIndexFromX]
  )

  const handleMouseUp = useCallback(() => {
    if (dragStart === null || dragEnd === null) {
      setDragStart(null)
      setDragEnd(null)
      return
    }
    const startIdx = Math.min(dragStart, dragEnd)
    const endIdx = Math.max(dragStart, dragEnd) + 1

    for (let i = startIdx; i < endIdx; i++) {
      const slotIso = slotIndexToIso(i, date, dayStartHour)
      if (dayjs(slotIso).isBefore(dayjs())) {
        setDragStart(null)
        setDragEnd(null)
        showNotification({
          type: NotificationTypes.Error,
          title: t('notification.announcement'),
          content: t('calendar.drag_into_past'),
        })
        return
      }
    }

    const isSingleCell = endIdx - startIdx === 1
    if (
      isSingleCell &&
      isSlotFullyAvailable &&
      !isSlotFullyAvailable(startIdx) &&
      !isSlotFullyBooked?.(startIdx)
    ) {
      setDragStart(null)
      setDragEnd(null)
      return
    }

    if (freeIntervals?.length) {
      const selStartIso = slotIndexToIso(startIdx, date, dayStartHour)
      const selEndIso = slotIndexToIso(endIdx, date, dayStartHour)
      const clamped = clampSelectionToFree(selStartIso, selEndIso, freeIntervals)
      if (clamped) {
        onDragComplete(clamped.start_at, clamped.end_at)
        setDragStart(null)
        setDragEnd(null)
        return
      }
    }

    for (let i = startIdx; i < endIdx; i++) {
      if (isSlotBooked(i)) {
        setDragStart(null)
        setDragEnd(null)
        showNotification({
          type: NotificationTypes.Error,
          title: t('notification.announcement'),
          content: t('calendar.drag_into_booked'),
        })
        return
      }
    }

    // Fallback when clamping did not apply: reject partial cells (gap click
    // handles those). Cells with zero availability keep the warn-and-allow flow.
    if (isSlotFullyAvailable) {
      for (let i = startIdx; i < endIdx; i++) {
        if (!isSlotFullyAvailable(i) && !isSlotFullyBooked?.(i)) {
          setDragStart(null)
          setDragEnd(null)
          showNotification({
            type: NotificationTypes.Error,
            title: t('notification.announcement'),
            content: t('calendar.drag_into_partial'),
          })
          return
        }
      }
    }

    if (isSlotFullyBooked) {
      for (let i = startIdx; i < endIdx; i++) {
        if (isSlotFullyBooked(i)) {
          showNotification({
            type: NotificationTypes.Warning,
            title: t('notification.announcement'),
            content: t('calendar.slot_fully_booked_warning'),
          })
          break
        }
      }
    }

    const startIso = slotIndexToIso(startIdx, date, dayStartHour)
    const endIso = slotIndexToIso(endIdx, date, dayStartHour)
    onDragComplete(startIso, endIso)
    setDragStart(null)
    setDragEnd(null)
  }, [
    dragStart,
    dragEnd,
    date,
    dayStartHour,
    isSlotBooked,
    isSlotFullyBooked,
    isSlotFullyAvailable,
    freeIntervals,
    onDragComplete,
    t,
  ])

  const selectionLeft = isDragging
    ? Math.min(dragStart!, dragEnd!) * slotWidth + 4
    : 0
  const selectionWidth = isDragging
    ? (Math.abs(dragEnd! - dragStart!) + 1) * slotWidth - 8
    : 0

  return {
    isDragging,
    selectionLeft,
    selectionWidth,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  }
}
