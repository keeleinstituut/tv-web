import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import CalendarIcon from 'assets/icons/calender.svg?react'
import ViewWeekIcon from 'assets/icons/view_week.svg?react'
import ViewMonthIcon from 'assets/icons/view_month.svg?react'
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
import CalendarSelect from 'components/molecules/CalendarSelect/CalendarSelect'
import { DatePickerComponent } from 'components/molecules/DatePickerInput/DatePickerInput'
import { toCalendarApiDateTime } from 'helpers/calendar'
import { CalendarView } from 'types/calendar'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import classes from './classes.module.scss'
import classNames from 'classnames'
import { useAuth } from 'components/contexts/AuthContext'

const DURATION_OPTIONS = [
  { value: 10, labelKey: 'calendar.up_to_10min' },
  { value: 20, labelKey: 'calendar.up_to_20min' },
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
  const { isTranslationAgency } = useAuth()
  const isInstitutionClientOrTPM = (isTPM || isClient) && !isTranslationAgency
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
            if (searchDate && !dayjs(start_at).isSame(dayjs(searchDate), 'day')) {
              showNotification(
                {
                  type: NotificationTypes.Warning,
                  title: t('calendar.no_slots_on_searched_date'),
                  content: t('calendar.no_slots_on_searched_date_content'),
                },
                5000
              )
            }
          } else {
            showNotification(
              {
                type: NotificationTypes.Warning,
                title: t(
                  isClient && !isTPM
                    ? 'calendar.no_slots_found_client'
                    : 'calendar.no_slots_found'
                ),
              },
              5000
            )
          }
        },
      }
    )
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

        {isInstitutionClientOrTPM && (
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
                <CalendarSelect
                  flat
                  value={searchLangId}
                  onChange={setSearchLangId}
                  options={languages.map((lang) => ({
                    value: lang.language.id,
                    label: lang.language.value.split('-')[0],
                  }))}
                  placeholder={t('calendar.select_language')}
                />
              </div>
            </div>

            <div className={classes.searchField}>
              <span className={classes.searchLabel}>
                {t('calendar.date_and_time')}
              </span>
              <div className={classes.searchInput}>
                <div className={classes.searchDatePicker}>
                  <DatePickerComponent
                    name="searchDate"
                    value={
                      searchDate ? dayjs(searchDate).format('DD/MM/YYYY') : ''
                    }
                    onChange={(val) =>
                      setSearchDate(
                        val ? dayjs(val, 'DD/MM/YYYY').format('YYYY-MM-DD') : ''
                      )
                    }
                  />
                </div>
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
                <CalendarSelect
                  flat
                  value={String(searchDuration)}
                  onChange={(v) => setSearchDuration(Number(v))}
                  options={DURATION_OPTIONS.map(({ value, labelKey }) => ({
                    value: String(value),
                    label: t(labelKey as never) as string,
                  }))}
                />
              </div>
            </div>
          </div>
        )}

        {isInstitutionClientOrTPM && (
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

        {isInstitutionClientOrTPM && (
          <button
            className={classes.addOrderButton}
            onClick={() => navigate('/calendar/new-order')}
          >
            {t('calendar.add_order')}
          </button>
        )}
      </div>
    </div>
  )
}

export default CalendarToolbar
