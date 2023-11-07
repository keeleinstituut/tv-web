import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Container from 'components/atoms/Container/Container'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import DynamicForm, {
  FieldProps,
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Path, useForm } from 'react-hook-form'
import classes from './classes.module.scss'
import { Root } from '@radix-ui/react-form'
import classNames from 'classnames'
import ToggleTabs from 'components/molecules/ToggleTabs/ToggleTabs'
import LogsTable from 'components/organisms/tables/LogsTable/LogsTable'
import { ReactComponent as Alarm } from 'assets/icons/alarm.svg'
import { useEventTypesFetch } from 'hooks/requests/useAuditLogs'
import { useDepartmentsFetch } from 'hooks/requests/useDepartments'

export enum DateTabs {
  Hour = 'hour',
  Last25h = 'last25h',
  Last7days = 'last7days',
  Last30days = 'last30days',
}

export type FormValues = {
  logs_time_range: string
  logs_date_range: string
  logs_department: string
  logs_activity: string
  logs_last_date: string
  logs_search: string
}

const Logs: FC = () => {
  const { t } = useTranslation()
  const { eventTypeFilters = [] } = useEventTypesFetch()
  const { departmentFilters = [] } = useDepartmentsFetch()

  const dateFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.DateRange,
      label: t('logs.date_range'),
      name: 'time_range' as Path<FormValues>,
      className: classes.dateInput,
    },
    {
      inputType: InputTypes.TimeRange,
      label: t('logs.time_range'),
      name: 'date_range' as Path<FormValues>,
      className: classNames(classes.inputSection, classes.dateInput),
      showSeconds: true,
      icon: Alarm,
    },
  ]

  const selectionFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'logs_department',
      ariaLabel: t('logs.select_department'),
      options: departmentFilters,
      placeholder: t('logs.select_department'),
      multiple: true,
      buttons: true,
      rules: {
        required: false,
      },
    },
    {
      inputType: InputTypes.Selections,
      name: 'logs_activity',
      ariaLabel: t('logs.select_activity'),
      options: eventTypeFilters,
      placeholder: t('logs.select_activity'),
      multiple: true,
      buttons: true,
      rules: {
        required: false,
      },
      className: classes.inputSection,
    },
  ]

  const dateTabs = [
    {
      label: t('logs.hour'),
      id: DateTabs.Hour,
    },
    {
      label: t('logs.last_24h'),
      id: DateTabs.Last25h,
    },
    {
      label: t('logs.last_7days'),
      id: DateTabs.Last7days,
    },
    {
      label: t('logs.last_30days'),
      id: DateTabs.Last30days,
    },
  ]

  const [activeTab, setActiveTab] = useState<string>(DateTabs.Hour)

  const { control } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
  })

  return (
    <>
      <div className={classes.logsHeader}>
        <h1>{t('menu.logs')}</h1>
        <Tooltip helpSectionKey="logs" />
      </div>

      <Container className={classes.container}>
        <div className={classes.buttonsContainer}>
          <h4 className={classes.filters}>{t('logs.filters')}</h4>
          <div className={classes.buttonsContainer}>
            <Button
              children={t('logs.clean_fields')}
              type="submit"
              ariaLabel={t('logs.clean_fields')}
              size={SizeTypes.S}
              appearance={AppearanceTypes.Secondary}
            />
            <Button
              children={t('logs.filter')}
              type="submit"
              ariaLabel={t('logs.filter')}
              size={SizeTypes.S}
              className={classes.filterButton}
            />
          </div>
        </div>

        <div className={classes.logsContainer}>
          <DynamicForm fields={dateFields} control={control} />
          <DynamicForm fields={selectionFields} control={control} />

          <div>
            <ToggleTabs
              tabs={dateTabs}
              activeTab={activeTab}
              className={classes.dateTabsRow}
              dateTabsClassName={classes.dateTabs}
              setActiveTab={setActiveTab}
            />
            <Root>
              <FormInput
                name="logs_search"
                ariaLabel={t('placeholder.search')}
                placeholder={t('placeholder.search')}
                inputType={InputTypes.Text}
                className={classes.searchInput}
                inputContainerClassName={classes.searchInnerContainer}
                control={control}
                isSearch
              />
            </Root>
          </div>
        </div>
      </Container>
      <div className={classNames(classes.dateInput, classes.downloadButton)}>
        <Button
          children={t('button.download_csv')}
          type="submit"
          ariaLabel={t('button.download_csv')}
          appearance={AppearanceTypes.Secondary}
        />
      </div>
      <Root>
        <LogsTable />
      </Root>
    </>
  )
}

export default Logs
