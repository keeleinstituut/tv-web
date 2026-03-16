import dayjs, { Dayjs } from 'dayjs'
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import { BookedSlot, CalendarLanguage, CalendarView } from 'types/calendar'

export type SidePanelIntent = 'view' | 'accept'

export interface SidePanelSelection {
  language: CalendarLanguage
  startIso: string
  endIso: string
  /** Present when opening an existing booked slot (view/accept mode) */
  slot?: BookedSlot
  /** 'accept' — Translator is reviewing an order for acceptance/decline */
  intent?: SidePanelIntent
  /** Pre-selected vendor when booking from a vendor row (TPM) */
  vendorId?: string
}

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
  allCollapsedOverride: boolean
  sidePanelSelection: SidePanelSelection | null
  openSidePanel: (selection: SidePanelSelection) => void
  closeSidePanel: () => void
  focusedLanguageId: string | null
  setFocusedLanguageId: (id: string | null) => void
  filteredLanguageIds: string[]
  setFilteredLanguageIds: (ids: string[]) => void
  pendingDeepLink: { slotId: string; date: string; intent: SidePanelIntent } | null
  setPendingDeepLink: (link: { slotId: string; date: string; intent: SidePanelIntent } | null) => void
  weekBookingPanel: { start_at: string; end_at: string; language_id: string } | null
  openWeekBookingPanel: (params: { start_at: string; end_at: string; language_id: string }) => void
  closeWeekBookingPanel: () => void
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
  allCollapsedOverride: false,
  sidePanelSelection: null,
  openSidePanel: () => undefined,
  closeSidePanel: () => undefined,
  focusedLanguageId: null,
  setFocusedLanguageId: () => undefined,
  filteredLanguageIds: [],
  setFilteredLanguageIds: () => undefined,
  pendingDeepLink: null,
  setPendingDeepLink: () => undefined,
  weekBookingPanel: null,
  openWeekBookingPanel: () => undefined,
  closeWeekBookingPanel: () => undefined,
})

export const CalendarProvider: FC<PropsWithChildren> = ({ children }) => {
  const [view, setView] = useState<CalendarView>('day')
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [expandedLanguageIds, setExpandedLanguageIds] = useState<string[]>([])
  const [allCollapsedOverride, setAllCollapsedOverride] = useState(false)
  const [sidePanelSelection, setSidePanelSelection] =
    useState<SidePanelSelection | null>(null)
  const [focusedLanguageId, setFocusedLanguageId] = useState<string | null>(null)
  const [filteredLanguageIds, setFilteredLanguageIds] = useState<string[]>([])
  const [pendingDeepLink, setPendingDeepLink] = useState<{
    slotId: string
    date: string
    intent: SidePanelIntent
  } | null>(null)
  const [weekBookingPanel, setWeekBookingPanel] = useState<{
    start_at: string
    end_at: string
    language_id: string
  } | null>(null)

  const openWeekBookingPanel = useCallback(
    (params: { start_at: string; end_at: string; language_id: string }) => {
      setWeekBookingPanel(params)
    },
    []
  )

  const closeWeekBookingPanel = useCallback(() => {
    setWeekBookingPanel(null)
  }, [])

  const openSidePanel = useCallback((selection: SidePanelSelection) => {
    setSidePanelSelection(selection)
  }, [])

  const closeSidePanel = useCallback(() => {
    setSidePanelSelection(null)
  }, [])

  const navigatePrev = useCallback(() => {
    setFocusedLanguageId(null)
    setCurrentDate((prev) => {
      if (view === 'day') return prev.subtract(1, 'day')
      if (view === 'week') return prev.subtract(1, 'week')
      return prev.subtract(1, 'month')
    })
  }, [view])

  const navigateNext = useCallback(() => {
    setFocusedLanguageId(null)
    setCurrentDate((prev) => {
      if (view === 'day') return prev.add(1, 'day')
      if (view === 'week') return prev.add(1, 'week')
      return prev.add(1, 'month')
    })
  }, [view])

  const navigatePrevMonth = useCallback(() => {
    setFocusedLanguageId(null)
    setCurrentDate((prev) => prev.subtract(1, 'month'))
  }, [])

  const navigateNextMonth = useCallback(() => {
    setFocusedLanguageId(null)
    setCurrentDate((prev) => prev.add(1, 'month'))
  }, [])

  const navigateToday = useCallback(() => {
    setCurrentDate(dayjs())
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedLanguageIds([])
    setAllCollapsedOverride(true)
  }, [])

  const toggleLanguageExpanded = useCallback((languageId: string) => {
    setAllCollapsedOverride(false)
    setExpandedLanguageIds((prev) =>
      prev.includes(languageId)
        ? prev.filter((id) => id !== languageId)
        : [...prev, languageId]
    )
  }, [])

  const isLanguageExpanded = useCallback(
    (languageId: string) => expandedLanguageIds.includes(languageId),
    [expandedLanguageIds]
  )

  const expandAll = useCallback((languageIds: string[]) => {
    setAllCollapsedOverride(false)
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
        allCollapsedOverride,
        sidePanelSelection,
        openSidePanel,
        closeSidePanel,
        focusedLanguageId,
        setFocusedLanguageId,
        filteredLanguageIds,
        setFilteredLanguageIds,
        pendingDeepLink,
        setPendingDeepLink,
        weekBookingPanel,
        openWeekBookingPanel,
        closeWeekBookingPanel,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export const useCalendarContext = () => useContext(CalendarContext)
