import { createContext, useContext } from 'react'

interface CalendarDayContextValue {
  date: string
  dayStartHour: number
  dayEndHour: number
  slotWidth: number
}

const CalendarDayContext = createContext<CalendarDayContextValue | null>(null)

export const CalendarDayProvider = CalendarDayContext.Provider

export function useCalendarDay(): CalendarDayContextValue {
  const ctx = useContext(CalendarDayContext)
  if (!ctx) throw new Error('useCalendarDay must be used inside CalendarDayProvider')
  return ctx
}
