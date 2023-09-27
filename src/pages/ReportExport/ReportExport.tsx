import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Container from 'components/atoms/Container/Container'
import Button from 'components/molecules/Button/Button'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useForm } from 'react-hook-form'
import { includes } from 'lodash'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'

import classes from './classes.module.scss'

export type FormValues = {
  orders_report_status: string
  orders_report_date: string
}

const ReportExport: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const statusCategoryOptions = [
    {
      label: 'Uus',
      value: 'Uus',
    },
    {
      label: 'Registreeritud',
      value: 'Registreeritud',
    },
    {
      label: 'Tühistatud',
      value: 'Tühistatud',
    },
    {
      label: 'Tellijale edastatud',
      value: 'Tellijale edastatud',
    },
    {
      label: 'Tagasi lükatud',
      value: 'Tagasi lükatud',
    },
    {
      label: 'Parandatud',
      value: 'Parandatud',
    },
    {
      label: 'Vastuvõetud',
      value: 'Vastuvõetud',
    },
  ]

  //TODO: Is it 1 option or multiple?
  const statusFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'orders_report_status',
      ariaLabel: t('orders_report.select_status'),
      options: statusCategoryOptions,
      placeholder: t('orders_report.select_status'),
      rules: {
        required: false,
      },
      // disabled: !includes(
      //   userPrivileges,
      //   Privileges.ExportInstitutionGeneralReport
      // ),
    },
  ]

  //TODO: Add date range after range task merged
  const reportDateRangeFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Date,
      name: 'orders_report_date',
      ariaLabel: t('orders_report.date_range'),
      label: `${t('orders_report.date_range')}`,
      placeholder: 'pp.kk.aaaa',
      rules: {
        required: false,
      },
      // disabled: !includes(
      //   userPrivileges,
      //   Privileges.ExportInstitutionGeneralReport
      // ),
    },
  ]

  const { control } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
  })

  return (
    <>
      <div className={classes.reportHeader}>
        <h1>{t('orders_report.export')}</h1>
        <Tooltip helpSectionKey="ordersReportExport" />
      </div>

      <Container className={classes.reportContainer}>
        <p className={classes.reportDescription}>
          {t('orders_report.description')}
        </p>
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
            //TODO: handle submit button
            // onClick={handleSubmit}
            // loading={isLoading}
            // hidden={
            //   !includes(
            //     userPrivileges,
            //     Privileges.ExportInstitutionGeneralReport
            //   )
            // }
          />
        </div>
      </Container>
    </>
  )
}

export default ReportExport
