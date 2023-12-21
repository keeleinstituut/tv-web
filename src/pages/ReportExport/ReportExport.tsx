import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Container from 'components/atoms/Container/Container'
import Button from 'components/molecules/Button/Button'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { SubmitHandler, useForm } from 'react-hook-form'
import { includes, map } from 'lodash'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'

import classes from './classes.module.scss'
import { ProjectStatus } from 'types/projects'
import { useExportProjects } from 'hooks/requests/useProjects'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import dayjs from 'dayjs'

interface FormValues {
  status?: ProjectStatus[]
  orders_report_date: { start: string; end: string }
}

const ReportExport: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { downloadCSV, isLoading } = useExportProjects()

  const statusFilters = map(ProjectStatus, (status) => ({
    label: t(`projects.status.${status}`),
    value: status,
  }))

  //TODO: Is it 1 option or multiple?
  const statusFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'status',
      ariaLabel: t('orders_report.select_status'),
      options: statusFilters,
      multiple: true,
      buttons: true,
      placeholder: t('orders_report.select_status'),
      rules: {
        required: false,
      },
      disabled: !includes(
        userPrivileges,
        Privileges.ExportInstitutionGeneralReport
      ),
    },
  ]

  const reportDateRangeFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.DateRange,
      label: `${t('orders_report.date_range')}`,
      name: 'orders_report_date',
      rules: {
        required: false,
      },
      className: classes.reportDateRange,
      disabled: !includes(
        userPrivileges,
        Privileges.ExportInstitutionGeneralReport
      ),
    },
  ]

  const { control, handleSubmit } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
  })

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const { status, orders_report_date } = values
      const payload = {
        status,
        date_from: dayjs(orders_report_date?.start, 'DD/MM/YYYY').format(
          'YYYY-MM-DD'
        ),
        date_to: dayjs(orders_report_date?.end, 'DD/MM/YYYY').format(
          'YYYY-MM-DD'
        ),
      }
      try {
        await downloadCSV(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.files_assigned_to_vendors'),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [downloadCSV, t]
  )

  return (
    <>
      <div className={classes.reportHeader}>
        <h1>{t('orders_report.export')}</h1>
        <Tooltip helpSectionKey="ordersReportExport" />
      </div>

      <Container className={classes.reportContainer}>
        <p>{t('orders_report.description')}</p>
        <div className={classes.dateRangeSection}>
          <DynamicForm fields={reportDateRangeFields} control={control} />
        </div>
        <div className={classes.statusSection}>
          <DynamicForm fields={statusFields} control={control} />
          <Button
            children={t('button.report_export_csv')}
            type="submit"
            ariaLabel={t('button.report_export_csv')}
            className={classes.exportButton}
            onClick={handleSubmit(onSubmit)}
            loading={isLoading}
            hidden={
              !includes(
                userPrivileges,
                Privileges.ExportInstitutionGeneralReport
              )
            }
          />
        </div>
      </Container>
    </>
  )
}

export default ReportExport
