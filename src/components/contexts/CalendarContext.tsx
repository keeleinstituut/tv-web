import dayjs, { Dayjs } from 'dayjs'
import { FC, PropsWithChildren, createContext, useCallback, useContext, useState } from 'react'
import { CalendarView } from 'types/calendar'

interface CalendarContextType {
  view: CalendarView
  setView: (view: CalendarView) => void
  currentDate: Dayjs
  setCurrentDate: (date: Dayjs) => void
  navigatePrev: () => void
  navigateNext: () => void
  navigatePrevMonth: () => void
  navigateNextMonth: () => void
  navigateToday: () => void
  expandedLanguageIds: string[]
  toggleLanguageExpanded: (languageId: string) => void
  isLanguageExpanded: (languageId: string) => boolean
  expandAll: (languageIds: string[]) => void
  collapseAll: () => void
}

const CalendarContext = createContext<CalendarContextType>({
  view: 'day',
  setView: () => undefined,
  currentDate: dayjs(),
  setCurrentDate: () => undefined,
  navigatePrev: () => undefined,
  navigateNext: () => undefined,
  navigatePrevMonth: () => undefined,
  navigateNextMonth: () => undefined,
  navigateToday: () => undefined,
  expandedLanguageIds: [],
  toggleLanguageExpanded: () => undefined,
  isLanguageExpanded: () => false,
  expandAll: () => undefined,
  collapseAll: () => undefined,
})

export const CalendarProvider: FC<PropsWithChildren> = ({ children }) => {
  const [view, setView] = useState<CalendarView>('day')
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [expandedLanguageIds, setExpandedLanguageIds] = useState<string[]>([])

  const navigatePrev = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === 'day') return prev.subtract(1, 'day')
      if (view === 'week') return prev.subtract(1, 'week')
      return prev.subtract(1, 'month')
    })
  }, [view])

  const navigateNext = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === 'day') return prev.add(1, 'day')
      if (view === 'week') return prev.add(1, 'week')
      return prev.add(1, 'month')
    })
  }, [view])

  const navigatePrevMonth = useCallback(() => {
    setCurrentDate((prev) => prev.subtract(1, 'month'))
  }, [])

  const navigateNextMonth = useCallback(() => {
    setCurrentDate((prev) => prev.add(1, 'month'))
  }, [])

  const navigateToday = useCallback(() => {
    setCurrentDate(dayjs())
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedLanguageIds([])
  }, [])

  const toggleLanguageExpanded = useCallback((languageId: string) => {
    setExpandedLanguageIds((prev) =>
      prev.includes(languageId) ? prev.filter((id) => id !== languageId) : [...prev, languageId]
    )
  }, [])

  const isLanguageExpanded = useCallback(
    (languageId: string) => expandedLanguageIds.includes(languageId),
    [expandedLanguageIds]
  )

  const expandAll = useCallback((languageIds: string[]) => {
    setExpandedLanguageIds(languageIds)
  }, [])

  return (
    <CalendarContext.Provider
      value={{
        view,
        setView,
        currentDate,
        setCurrentDate,
        navigatePrev,
        navigateNext,
        navigatePrevMonth,
        navigateNextMonth,
        navigateToday,
        expandedLanguageIds,
        toggleLanguageExpanded,
        isLanguageExpanded,
        expandAll,
        collapseAll,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export const useCalendarContext = () => useContext(CalendarContext)
