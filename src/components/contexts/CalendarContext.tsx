import dayjs, { Dayjs } from 'dayjs'
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { BookedSlot, CalendarLanguage, CalendarView } from 'types/calendar'

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface SidePanelSelection {
  language: CalendarLanguage
  startIso: string
  endIso: string
  /** Present when opening an existing booked slot */
  slot?: BookedSlot
  /** Pre-selected vendor when booking from a vendor row (TPM) */
  vendorId?: string
  vendorName?: string
}

// ─── CalendarNavContext ───────────────────────────────────────────────────────
// Changes on date navigation and view switching.

interface CalendarNavContextType {
  view: CalendarView
  setView: (view: CalendarView) => void
  currentDate: Dayjs
  setCurrentDate: (date: Dayjs) => void
  navigatePrev: () => void
  navigateNext: () => void
  navigatePrevMonth: () => void
  navigateNextMonth: () => void
  navigateToday: () => void
  isSearching: boolean
  setIsSearching: (v: boolean) => void
}

const CalendarNavContext = createContext<CalendarNavContextType>({
  view: 'day',
  setView: () => undefined,
  currentDate: dayjs(),
  setCurrentDate: () => undefined,
  navigatePrev: () => undefined,
  navigateNext: () => undefined,
  navigatePrevMonth: () => undefined,
  navigateNextMonth: () => undefined,
  navigateToday: () => undefined,
  isSearching: false,
  setIsSearching: () => undefined,
})

export const useCalendarNav = () => useContext(CalendarNavContext)

// ─── CalendarExpansionContext ─────────────────────────────────────────────────
// Changes on row expand/collapse.

interface CalendarExpansionContextType {
  expandedLanguageIds: string[]
  toggleLanguageExpanded: (languageId: string) => void
  isLanguageExpanded: (languageId: string) => boolean
  expandAll: (languageIds: string[]) => void
  collapseAll: () => void
  allCollapsedOverride: boolean
}

const CalendarExpansionContext = createContext<CalendarExpansionContextType>({
  expandedLanguageIds: [],
  toggleLanguageExpanded: () => undefined,
  isLanguageExpanded: () => false,
  expandAll: () => undefined,
  collapseAll: () => undefined,
  allCollapsedOverride: false,
})

export const useCalendarExpansion = () => useContext(CalendarExpansionContext)

// ─── CalendarPanelContext ─────────────────────────────────────────────────────
// Changes on panel open/close, deep-link, and language focus.

interface CalendarPanelContextType {
  sidePanelSelection: SidePanelSelection | null
  openSidePanel: (selection: SidePanelSelection) => void
  closeSidePanel: () => void
  focusedLanguageId: string | null
  setFocusedLanguageId: (id: string | null) => void
  pendingDeepLink: { slotId: string; date: string } | null
  setPendingDeepLink: (link: { slotId: string; date: string } | null) => void
  weekBookingPanel: {
    start_at: string
    end_at: string
    language_id: string
    language: CalendarLanguage
    bookings: BookedSlot[]
  } | null
  openWeekBookingPanel: (params: {
    start_at: string
    end_at: string
    language_id: string
    language: CalendarLanguage
    bookings: BookedSlot[]
  }) => void
  closeWeekBookingPanel: () => void
}

const CalendarPanelContext = createContext<CalendarPanelContextType>({
  sidePanelSelection: null,
  openSidePanel: () => undefined,
  closeSidePanel: () => undefined,
  focusedLanguageId: null,
  setFocusedLanguageId: () => undefined,
  pendingDeepLink: null,
  setPendingDeepLink: () => undefined,
  weekBookingPanel: null,
  openWeekBookingPanel: () => undefined,
  closeWeekBookingPanel: () => undefined,
})

export const useCalendarPanel = () => useContext(CalendarPanelContext)

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CalendarProvider: FC<PropsWithChildren> = ({ children }) => {
  // Nav state
  const [view, setView] = useState<CalendarView>('day')
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [isSearching, setIsSearching] = useState(false)

  // Expansion state
  const [expandedLanguageIds, setExpandedLanguageIds] = useState<string[]>([])
  const [allCollapsedOverride, setAllCollapsedOverride] = useState(false)

  // Panel state
  const [sidePanelSelection, setSidePanelSelection] =
    useState<SidePanelSelection | null>(null)
  const [focusedLanguageId, setFocusedLanguageId] = useState<string | null>(
    null
  )
  const [pendingDeepLink, setPendingDeepLink] = useState<{
    slotId: string
    date: string
  } | null>(null)
  const [weekBookingPanel, setWeekBookingPanel] = useState<{
    start_at: string
    end_at: string
    language_id: string
    language: CalendarLanguage
    bookings: BookedSlot[]
  } | null>(null)

  // Nav callbacks
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

  // Expansion callbacks
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

  // Panel callbacks
  const openSidePanel = useCallback((selection: SidePanelSelection) => {
    setSidePanelSelection(selection)
  }, [])

  const closeSidePanel = useCallback(() => {
    setSidePanelSelection(null)
  }, [])

  const openWeekBookingPanel = useCallback(
    (params: {
      start_at: string
      end_at: string
      language_id: string
      language: CalendarLanguage
      bookings: BookedSlot[]
    }) => {
      setWeekBookingPanel(params)
    },
    []
  )

  const closeWeekBookingPanel = useCallback(() => {
    setWeekBookingPanel(null)
  }, [])

  // Memoized context values — each only updates when its own state changes
  const navValue = useMemo<CalendarNavContextType>(
    () => ({
      view,
      setView,
      currentDate,
      setCurrentDate,
      navigatePrev,
      navigateNext,
      navigatePrevMonth,
      navigateNextMonth,
      navigateToday,
      isSearching,
      setIsSearching,
    }),
    [
      view,
      currentDate,
      navigatePrev,
      navigateNext,
      navigatePrevMonth,
      navigateNextMonth,
      navigateToday,
      isSearching,
    ]
  )

  const expansionValue = useMemo<CalendarExpansionContextType>(
    () => ({
      expandedLanguageIds,
      toggleLanguageExpanded,
      isLanguageExpanded,
      expandAll,
      collapseAll,
      allCollapsedOverride,
    }),
    [
      expandedLanguageIds,
      toggleLanguageExpanded,
      isLanguageExpanded,
      expandAll,
      collapseAll,
      allCollapsedOverride,
    ]
  )

  const panelValue = useMemo<CalendarPanelContextType>(
    () => ({
      sidePanelSelection,
      openSidePanel,
      closeSidePanel,
      focusedLanguageId,
      setFocusedLanguageId,
      pendingDeepLink,
      setPendingDeepLink,
      weekBookingPanel,
      openWeekBookingPanel,
      closeWeekBookingPanel,
    }),
    [
      sidePanelSelection,
      openSidePanel,
      closeSidePanel,
      focusedLanguageId,
      pendingDeepLink,
      weekBookingPanel,
      openWeekBookingPanel,
      closeWeekBookingPanel,
    ]
  )

  return (
    <CalendarNavContext.Provider value={navValue}>
      <CalendarExpansionContext.Provider value={expansionValue}>
        <CalendarPanelContext.Provider value={panelValue}>
          {children}
        </CalendarPanelContext.Provider>
      </CalendarExpansionContext.Provider>
    </CalendarNavContext.Provider>
  )
}
