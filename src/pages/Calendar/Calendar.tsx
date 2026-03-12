import { FC, useEffect } from 'react'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router'
import { CalendarProvider } from 'components/contexts/CalendarContext'
import {
  useCalendarContext,
  SidePanelIntent,
} from 'components/contexts/CalendarContext'
import CalendarToolbar from 'components/organisms/CalendarToolbar/CalendarToolbar'
import CalendarDayView from 'components/organisms/CalendarDayView/CalendarDayView'
import CalendarWeekView from 'components/organisms/CalendarWeekView/CalendarWeekView'
import CalendarMonthView from 'components/organisms/CalendarMonthView/CalendarMonthView'
import CalendarOrderSidePanel from 'components/organisms/CalendarOrderSidePanel/CalendarOrderSidePanel'
import CalendarDevRoleSelector from 'components/atoms/CalendarDevRoleSelector/CalendarDevRoleSelector'
import CalendarTranslatorNotification from 'components/molecules/CalendarTranslatorNotification/CalendarTranslatorNotification'
import CalendarClientNotification from 'components/molecules/CalendarClientNotification/CalendarClientNotification'
import { useCalendarRole } from 'hooks/useCalendarRole'
import {
  useFetchCalendarDay,
  useFetchCalendarTranslatorLanguages,
} from 'hooks/requests/useCalendar'
import { isSlotPast } from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import classes from './classes.module.scss'

const CalendarContent: FC = () => {
  const { view, setView, setCurrentDate, setPendingDeepLink } =
    useCalendarContext()
  const [searchParams] = useSearchParams()
  const { isTranslator, isClient } = useCalendarRole()
  const today = dayjs().format('YYYY-MM-DD')
  const { languages: translatorLanguages } = useFetchCalendarTranslatorLanguages()
  const primaryLanguage = translatorLanguages[0] ?? null
  const { data: todayData } = useFetchCalendarDay(
    isTranslator || isClient ? today : '',
    primaryLanguage?.language.id
  )

  // TODO: restore !isSlotPast check once backend is wired up
  const pendingSlot = isTranslator
    ? (todayData?.booked_slots ?? []).find(
        (s) => s.type === 'assignment' && s.assignment?.confirmed === false
      ) ?? null
    : null

  const confirmedSlot = isClient
    ? (todayData?.booked_slots ?? []).find(
        (s) =>
          s.type === 'assignment' &&
          !isSlotPast(s.start_at) &&
          s.assignment?.confirmed === true
      ) ?? null
    : null

  useEffect(() => {
    const slotId = searchParams.get('slotId')
    const date = searchParams.get('date')
    const intent = searchParams.get('intent') as SidePanelIntent | null
    if (slotId && date && intent) {
      setCurrentDate(dayjs(date))
      setView('day')
      setPendingDeepLink({ slotId, date, intent })
    }
  }, []) // eslint-disable-line

  return (
    <div className={classes.container}>
      {pendingSlot && primaryLanguage && (
        <CalendarTranslatorNotification
          slot={pendingSlot}
          language={primaryLanguage}
        />
      )}
      {confirmedSlot && primaryLanguage && (
        <CalendarClientNotification
          slot={confirmedSlot}
          language={primaryLanguage}
        />
      )}
      <CalendarToolbar />
      {view === 'day' && <CalendarDayView />}
      {view === 'week' && <CalendarWeekView />}
      {view === 'month' && <CalendarMonthView />}
      <CalendarOrderSidePanel />
      <CalendarDevRoleSelector />
    </div>
  )
}

const Calendar: FC = () => (
  <CalendarProvider>
    <CalendarContent />
  </CalendarProvider>
)

export default Calendar
