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
  navigateToday: () => void
  expandedLanguageIds: string[]
  toggleLanguageExpanded: (languageId: string) => void
  isLanguageExpanded: (languageId: string) => boolean
  allExpanded: boolean
  setAllExpanded: (value: boolean) => void
}

const CalendarContext = createContext<CalendarContextType>({
  view: 'day',
  setView: () => undefined,
  currentDate: dayjs(),
  setCurrentDate: () => undefined,
  navigatePrev: () => undefined,
  navigateNext: () => undefined,
  navigateToday: () => undefined,
  expandedLanguageIds: [],
  toggleLanguageExpanded: () => undefined,
  isLanguageExpanded: () => false,
  allExpanded: false,
  setAllExpanded: () => undefined,
})

export const CalendarProvider: FC<PropsWithChildren> = ({ children }) => {
  const [view, setView] = useState<CalendarView>('day')
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [expandedLanguageIds, setExpandedLanguageIds] = useState<string[]>([])
  const [allExpanded, setAllExpanded] = useState(false)

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

  const navigateToday = useCallback(() => {
    setCurrentDate(dayjs())
  }, [])

  const toggleLanguageExpanded = useCallback((languageId: string) => {
    setExpandedLanguageIds((prev) =>
      prev.includes(languageId) ? prev.filter((id) => id !== languageId) : [...prev, languageId]
    )
  }, [])

  const isLanguageExpanded = useCallback(
    (languageId: string) => allExpanded || expandedLanguageIds.includes(languageId),
    [allExpanded, expandedLanguageIds]
  )

  return (
    <CalendarContext.Provider
      value={{
        view,
        setView,
        currentDate,
        setCurrentDate,
        navigatePrev,
        navigateNext,
        navigateToday,
        expandedLanguageIds,
        toggleLanguageExpanded,
        isLanguageExpanded,
        allExpanded,
        setAllExpanded,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export const useCalendarContext = () => useContext(CalendarContext)
