import { RefObject, useCallback, useState } from 'react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { slotIndexToIso } from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'

interface Options {
  rowRef: RefObject<HTMLDivElement>
  date: string
  dayStartHour: number
  totalSlots: number
  slotWidth: number
  isSlotBooked: (slotIndex: number) => boolean
  isSlotFullyBooked?: (slotIndex: number) => boolean
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
      if (dayjs(slotIso).isBefore(dayjs()) || isSlotBooked(idx)) return
      setDragStart(idx)
      setDragEnd(idx)
    },
    [getSlotIndexFromX, date, dayStartHour, isSlotBooked]
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
  }, [dragStart, dragEnd, date, dayStartHour, isSlotBooked, isSlotFullyBooked, onDragComplete, t])

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
