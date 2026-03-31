import { FC, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import CalendarIcon from 'assets/icons/calender.svg?react'
import ViewWeekIcon from 'assets/icons/view_week.svg?react'
import ViewMonthIcon from 'assets/icons/view_month.svg?react'
import HorizontalDotsIcon from 'assets/icons/horizontal_dots.svg?react'
import ChevronLeftIcon from 'assets/icons/chevron_left.svg?react'
import {
  useCalendarNav,
  useCalendarPanel,
} from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'
import {
  useCalendarSearch,
  useFetchCalendarLanguages,
} from 'hooks/requests/useCalendar'
import CalendarTimeSelect from 'components/molecules/CalendarTimeSelect/CalendarTimeSelect'
import { toCalendarApiDateTime } from 'helpers/calendar'
import { openNativeDateTimePicker } from 'helpers/nativeDateTimeInput'
import { CalendarView } from 'types/calendar'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import classes from './classes.module.scss'
import classNames from 'classnames'

const DURATION_OPTIONS = [
  { value: 30, labelKey: 'calendar.up_to_30min' },
  { value: 60, labelKey: 'calendar.up_to_1h' },
  { value: 120, labelKey: 'calendar.up_to_2h' },
  { value: 180, labelKey: 'calendar.up_to_3h' },
  { value: 240, labelKey: 'calendar.up_to_4h' },
]

const CalendarToolbar: FC = () => {
  const { t } = useTranslation()
  const { view, setView, currentDate, setCurrentDate, setIsSearching } =
    useCalendarNav()
  const { setFocusedLanguageId } = useCalendarPanel()
  const navigate = useNavigate()
  const { isTPM, isClient } = useCalendarRole()
  const canSearch = isTPM || isClient
  const { languages } = useFetchCalendarLanguages(
    currentDate.format('YYYY-MM-DD')
  )
  const { mutate: runSearch, isPending: isSearching } = useCalendarSearch()

  useEffect(() => {
    setIsSearching(isSearching)
  }, [isSearching, setIsSearching])

  const [searchLangId, setSearchLangId] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [searchTime, setSearchTime] = useState('')
  const [searchDuration, setSearchDuration] = useState(60)
  const [moreOpen, setMoreOpen] = useState(false)

  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!moreOpen) return
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [moreOpen])

  const views: {
    key: CalendarView
    label: string
    Icon: FC<{ className?: string }>
  }[] = [
    { key: 'day', label: t('calendar.today'), Icon: CalendarIcon },
    { key: 'week', label: t('calendar.week'), Icon: ViewWeekIcon },
    { key: 'month', label: t('calendar.month'), Icon: ViewMonthIcon },
  ]

  const isPastDate = searchDate
    ? dayjs(searchDate).isBefore(dayjs().startOf('day'))
    : false

  const handleSearch = () => {
    if (!searchLangId) return
    const datetime =
      searchDate && searchTime
        ? toCalendarApiDateTime(
            dayjs(`${searchDate}T${searchTime}:00`).toISOString()
          )
        : searchDate
          ? toCalendarApiDateTime(
              dayjs(`${searchDate}T${dayjs().format('HH:mm')}:00`).toISOString()
            )
          : toCalendarApiDateTime(dayjs().toISOString())
    runSearch(
      {
        language_id: searchLangId,
        datetime,
        duration_minutes: searchDuration,
      },
      {
        onSuccess: ({ start_at }) => {
          if (start_at) {
            setCurrentDate(dayjs(start_at))
            setView('day')
            setFocusedLanguageId(searchLangId)
          } else {
            showNotification(
              {
                type: NotificationTypes.Warning,
                title: t('calendar.no_slots_found'),
              },
              5000
            )
          }
        },
      }
    )
  }

  const handleAddOrder = () => {
    setMoreOpen(false)
    navigate('/calendar/new-order')
  }

  return (
    <div className={classes.toolbar}>
      <div className={classes.content}>
        <div className={classes.tabs}>
          {views.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={classNames(classes.tab, {
                [classes.tabActive]: view === key,
              })}
              onClick={() => setView(key)}
            >
              <Icon className={classes.tabIcon} />
              {label}
            </button>
          ))}
        </div>

        {canSearch && (
          <div className={classes.searchGroup}>
            <div className={classes.searchField}>
              <span className={classes.searchLabel}>
                {t('calendar.language')}
              </span>
              <div
                className={classNames(
                  classes.searchInput,
                  classes.searchInputSelect
                )}
              >
                <span className={classes.searchSelectValue}>
                  {searchLangId
                    ? languages
                        .find((l) => l.language.id === searchLangId)
                        ?.language.value.split('-')[0]
                    : t('calendar.select_language')}
                </span>
                <ChevronLeftIcon className={classes.searchChevron} />
                <select
                  className={classes.searchSelectOverlay}
                  value={searchLangId}
                  onChange={(e) => setSearchLangId(e.target.value)}
                >
                  <option value="">{t('calendar.select_language')}</option>
                  {languages.map((lang) => (
                    <option key={lang.language.id} value={lang.language.id}>
                      {lang.language.value.split('-')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={classes.searchField}>
              <span className={classes.searchLabel}>
                {t('calendar.date_and_time')}
              </span>
              <div className={classes.searchInput}>
                <input
                  type="date"
                  className={classes.searchDatetime}
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  onClick={openNativeDateTimePicker}
                />
                <span className={classes.searchDateSep} />
                <div className={classes.searchDatetimeSlot}>
                  <CalendarTimeSelect
                    allowEmpty
                    className={classes.searchDatetime}
                    value={searchTime}
                    onChange={setSearchTime}
                  />
                </div>
              </div>
            </div>

            <div className={classes.searchField}>
              <span className={classes.searchLabel}>
                {t('calendar.duration')}
              </span>
              <div
                className={classNames(
                  classes.searchInput,
                  classes.searchInputLast,
                  classes.searchInputSelect
                )}
              >
                <span className={classes.searchSelectValue}>
                  {t(
                    DURATION_OPTIONS.find((o) => o.value === searchDuration)
                      ?.labelKey as never
                  )}
                </span>
                <ChevronLeftIcon className={classes.searchChevron} />
                <select
                  className={classes.searchSelectOverlay}
                  value={searchDuration}
                  onChange={(e) => setSearchDuration(Number(e.target.value))}
                >
                  {DURATION_OPTIONS.map(({ value, labelKey }) => (
                    <option key={value} value={value}>
                      {t(labelKey as never)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {canSearch && (
          <div className={classes.findWrapper}>
            <button
              className={classNames(classes.findButton, {
                [classes.findButtonDisabled]:
                  !searchLangId || isSearching || isPastDate,
              })}
              onClick={handleSearch}
              disabled={!searchLangId || isSearching || isPastDate}
            >
              {isSearching ? t('calendar.searching') : t('calendar.find_slot')}
            </button>
          </div>
        )}

        {canSearch && (
          <div className={classes.moreWrapper} ref={moreRef}>
            <button
              className={classes.moreButton}
              onClick={() => setMoreOpen((o) => !o)}
            >
              {t('calendar.more')}
              <HorizontalDotsIcon className={classes.moreIcon} />
            </button>
            {moreOpen && (
              <div className={classes.moreDropdown}>
                <button
                  className={classes.moreDropdownItem}
                  onClick={handleAddOrder}
                >
                  {t('calendar.add_order')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarToolbar
