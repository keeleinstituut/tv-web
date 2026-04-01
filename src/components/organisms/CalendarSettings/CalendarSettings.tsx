import { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import Container from 'components/atoms/Container/Container'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useImportCalendar } from 'hooks/requests/useCalendar'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import classes from './classes.module.scss'

const CalendarSettings: FC = () => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutateAsync: importCalendar, isLoading } = useImportCalendar()
  const [lastImport, setLastImport] = useState<{
    eventsCount: number
    dateTo: string
  } | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const importEndDate = dayjs().add(1, 'year').format('YYYY-MM-DD')
    try {
      const res = await importCalendar({ file, importEndDate })
      const data = res?.data
      setLastImport({
        eventsCount: data?.events_count ?? 0,
        dateTo: data?.date_to ?? '',
      })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('calendar_settings.import_success', {
          count: data?.events_count ?? 0,
        }),
      })
    } catch (err) {
      showValidationErrorMessage(err)
    }
  }

  return (
    <Container className={classes.container}>
        <p className={classes.sectionTitle}>
          {t('calendar_settings.import_title')}
        </p>
        <p className={classes.description}>
          {t('calendar_settings.import_description')}
        </p>
        {lastImport && (
          <p className={classes.lastImport}>
            {t('calendar_settings.last_import_info', {
              count: lastImport.eventsCount,
              date: dayjs(lastImport.dateTo).format('DD.MM.YYYY'),
            })}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".ics"
          className={classes.hiddenInput}
          onChange={handleFileChange}
        />
        <Button
          appearance={AppearanceTypes.Primary}
          onClick={() => fileInputRef.current?.click()}
          loading={isLoading}
          className={classes.importButton}
        >
          {t('calendar_settings.import_button')}
        </Button>
    </Container>
  )
}

export default CalendarSettings
