import { FC, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import CalendarIcon from 'assets/icons/calender.svg?react'
import ViewWeekIcon from 'assets/icons/view_week.svg?react'
import ViewMonthIcon from 'assets/icons/view_month.svg?react'
import HorizontalDotsIcon from 'assets/icons/horizontal_dots.svg?react'
import ChevronDownIcon from 'assets/icons/chevron_left.svg?react'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'
import {
  useCalendarSearch,
  useFetchCalendarLanguages,
} from 'hooks/requests/useCalendar'
import { CalendarView } from 'types/calendar'
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
  const {
    view,
    setView,
    currentDate,
    setCurrentDate,
    focusedLanguageId,
    setFocusedLanguageId,
  } = useCalendarContext()
  const navigate = useNavigate()
  const { isTPM, isClient } = useCalendarRole()
  const canSearch = isTPM || isClient
  const { languages } = useFetchCalendarLanguages()
  const { mutate: runSearch, isPending: isSearching } = useCalendarSearch()

  const [searchLangId, setSearchLangId] = useState('')
  const [searchFrom, setSearchFrom] = useState('')
  const [searchDuration, setSearchDuration] = useState(60)
  const [moreOpen, setMoreOpen] = useState(false)
  const [noResults, setNoResults] = useState(false)

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

  const views: { key: CalendarView; label: string; Icon: FC }[] = [
    { key: 'day', label: t('calendar.today'), Icon: CalendarIcon },
    { key: 'week', label: t('calendar.week'), Icon: ViewWeekIcon },
    { key: 'month', label: t('calendar.month'), Icon: ViewMonthIcon },
  ]

  const handleSearch = () => {
    if (!searchLangId) return
    setNoResults(false)
    const base = searchFrom ? dayjs(searchFrom) : currentDate
    runSearch(
      {
        language_id: searchLangId,
        date_from: base.format('YYYY-MM-DD'),
        date_to: base.add(30, 'day').format('YYYY-MM-DD'),
        slot_length: searchDuration,
        start_time: searchFrom ? dayjs(searchFrom).format('HH:mm') : undefined,
      },
      {
        onSuccess: ({ dates }) => {
          if (dates.length > 0) {
            setCurrentDate(dayjs(dates[0]))
            setView('day')
            setFocusedLanguageId(searchLangId)
          } else {
            setNoResults(true)
          }
        },
      }
    )
  }

  const handleAddOrder = () => {
    setMoreOpen(false)
    navigate('/calendar/new-order')
  }

  const focusedLang = focusedLanguageId
    ? languages.find((l) => l.language.id === focusedLanguageId)
    : null

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
              <div className={classes.searchInput}>
                <select
                  className={classes.searchSelect}
                  value={searchLangId}
                  onChange={(e) => {
                    setSearchLangId(e.target.value)
                    setNoResults(false)
                  }}
                >
                  <option value="">{t('calendar.select_language')}</option>
                  {languages.map((lang) => (
                    <option key={lang.language.id} value={lang.language.id}>
                      {lang.language.value}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className={classes.searchChevron} />
              </div>
            </div>

            <div className={classes.searchField}>
              <span className={classes.searchLabel}>
                {t('calendar.date_and_time')}
              </span>
              <div className={classes.searchInput}>
                <input
                  type="datetime-local"
                  className={classes.searchDatetime}
                  value={searchFrom}
                  onChange={(e) => {
                    setSearchFrom(e.target.value)
                    setNoResults(false)
                  }}
                  placeholder={t('calendar.from')}
                />
              </div>
            </div>

            <div className={classes.searchField}>
              <span className={classes.searchLabel}>
                {t('calendar.duration')}
              </span>
              <div
                className={classNames(
                  classes.searchInput,
                  classes.searchInputLast
                )}
              >
                <select
                  className={classes.searchSelect}
                  value={searchDuration}
                  onChange={(e) => setSearchDuration(Number(e.target.value))}
                >
                  {DURATION_OPTIONS.map(({ value, labelKey }) => (
                    <option key={value} value={value}>
                      {t(labelKey as never)}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className={classes.searchChevron} />
              </div>
            </div>
          </div>
        )}

        {canSearch && (
          <div className={classes.findWrapper}>
            <button
              className={classNames(classes.findButton, {
                [classes.findButtonDisabled]: !searchLangId || isSearching,
              })}
              onClick={handleSearch}
              disabled={!searchLangId || isSearching}
            >
              {isSearching
                ? t('calendar.searching')
                : t('calendar.find_slot')}
            </button>
            {noResults && (
              <span className={classes.noResults}>
                {t('calendar.no_slots_found')}
              </span>
            )}
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
