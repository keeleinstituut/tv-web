import { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { Root } from '@radix-ui/react-form'
import Container from 'components/atoms/Container/Container'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import DatePickerInput from 'components/molecules/DatePickerInput/DatePickerInput'
import {
  useImportCalendar,
  useDeleteCalendarImportBulk,
  useFetchCalendarImports,
} from 'hooks/requests/useCalendar'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import classes from './VendorCalendarImport.module.scss'

const VendorCalendarImport: FC = () => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutateAsync: importCalendar, isLoading } = useImportCalendar()
  const { imports } = useFetchCalendarImports()
  const { mutateAsync: deleteBulk, isLoading: isDeletingBulk } =
    useDeleteCalendarImportBulk()
  const [endDate, setEndDate] = useState('')

  const hasImport = imports.length > 0

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const importEndDate = dayjs(endDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
    try {
      const res = await importCalendar({ file, importEndDate })
      const data = res?.data
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

  const handleDeleteBulk = async () => {
    if (!window.confirm(t('calendar_settings.confirm_delete_import'))) return
    try {
      await deleteBulk()
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('calendar_settings.delete_import_success'),
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
      <Root>
        <div className={classes.endDatePicker}>
          <p className={classes.endDateLabel}>
            {t('calendar_settings.import_end_date')}
            <span className={classes.required}>*</span>
          </p>
          <DatePickerInput
            name="import_end_date"
            value={endDate}
            onChange={(val) => setEndDate(val)}
            minDate={new Date()}
          />
        </div>
      </Root>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ics"
        className={classes.hiddenInput}
        onChange={handleFileChange}
      />
      <div className={classes.buttonRow}>
        <Button
          appearance={AppearanceTypes.Primary}
          onClick={() => fileInputRef.current?.click()}
          loading={isLoading}
          disabled={!endDate}
        >
          {t('calendar_settings.import_button')}
        </Button>
        {hasImport && (
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={handleDeleteBulk}
            loading={isDeletingBulk}
          >
            {t('calendar_settings.delete_import')}
          </Button>
        )}
      </div>
    </Container>
  )
}

export default VendorCalendarImport
