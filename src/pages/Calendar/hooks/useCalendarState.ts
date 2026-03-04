import { useCallback, useMemo, useState } from 'react'
import type { CalendarView } from '../components/CalendarFilter/CalendarFilter'

export interface UseCalendarStateResult {
  view: CalendarView
  setView: (view: CalendarView) => void
  date: Date
  dateYmd: string
  monthLabel: string
  weekdayLetter: string
  dateLabel: string
  handlePreviousMonth: () => void
  handleNextMonth: () => void
  handlePreviousDay: () => void
  handleNextDay: () => void
}

export const useCalendarState = (): UseCalendarStateResult => {
  const [view, setView] = useState<CalendarView>('today')
  const [date, setDate] = useState(() => new Date())

  const dateYmd = useMemo(() => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }, [date])

  const monthLabel = useMemo(
    () =>
      date.toLocaleDateString('et-EE', {
        month: 'long',
      }),
    [date]
  )

  const weekdayLetter = useMemo(
    () => date.toLocaleDateString('et-EE', { weekday: 'narrow' }),
    [date]
  )

  const dateLabel = useMemo(
    () =>
      date.toLocaleDateString('et-EE', {
        day: '2-digit',
        month: '2-digit',
      }),
    [date]
  )

  const handlePreviousMonth = useCallback(() => {
    setDate((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() - 1)
      return next
    })
  }, [])

  const handleNextMonth = useCallback(() => {
    setDate((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + 1)
      return next
    })
  }, [])

  const handlePreviousDay = useCallback(() => {
    setDate((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() - 1)
      return next
    })
  }, [])

  const handleNextDay = useCallback(() => {
    setDate((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + 1)
      return next
    })
  }, [])

  return {
    view,
    setView,
    date,
    dateYmd,
    monthLabel,
    weekdayLetter,
    dateLabel,
    handlePreviousMonth,
    handleNextMonth,
    handlePreviousDay,
    handleNextDay,
  }
}

