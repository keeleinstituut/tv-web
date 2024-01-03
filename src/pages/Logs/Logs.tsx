import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { FC, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Container from 'components/atoms/Container/Container'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Path, SubmitHandler, useForm } from 'react-hook-form'
import classes from './classes.module.scss'
import classNames from 'classnames'
import LogsTable from 'components/organisms/tables/LogsTable/LogsTable'
import { ReactComponent as Alarm } from 'assets/icons/alarm.svg'
import {
  useExportAuditLogsCSV,
  useFetchAuditLogs,
} from 'hooks/requests/useAuditLogs'
import { useDepartmentsFetch } from 'hooks/requests/useDepartments'
import { isEmpty, isEqual, map, pickBy, size, split, toNumber } from 'lodash'
import dayjs from 'dayjs'
import useValidators from 'hooks/useValidators'
import i18n from 'i18n/i18n'
import { showValidationErrorMessage } from 'api/errorHandler'
import { AuditLogPayloadType, EventTypes } from 'types/auditLogs'

export enum DateTabs {
  Hour = '1 hour',
  Last24h = '24 hour',
  Last7days = '7 days',
  Last30days = '30 days',
}

export type FormValues = {
  time_range: { start: string; end: string }
  date_range: { start: string; end: string }
  department_id: string
  activity: string
  last_date: string
  search: string
  payload: object
}

const dateTabs = [
  {
    label: i18n.t('logs.hour'),
    id: DateTabs.Hour,
  },
  {
    label: i18n.t('logs.last_24h'),
    id: DateTabs.Last24h,
  },
  {
    label: i18n.t('logs.last_7days'),
    id: DateTabs.Last7days,
  },
  {
    label: i18n.t('logs.last_30days'),
    id: DateTabs.Last30days,
  },
]

const Logs: FC = () => {
  const { t } = useTranslation()
  const { minLengthValidator, timeRangePickerValidator } = useValidators()
  const {
    logsData,
    paginationData,
    handleFilterChange,
    handlePaginationChange,
    isLoading,
  } = useFetchAuditLogs()
  const { departmentFilters = [] } = useDepartmentsFetch()
  const { exportCSV } = useExportAuditLogsCSV()
  const currentDate = dayjs()
  const currentTime = currentDate.format('HH:mm:ss')

  const {
    control,
    watch,
    setValue,
    getValues,
    resetField,
    reset,
    handleSubmit,
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: {
      date_range: {},
      time_range: {},
      last_date: dateTabs[0].id,
    },
  })

  const dateFields: FieldProps<FormValues>[] = [
    // {
    //   inputType: InputTypes.DateRange,
    //   label: t('logs.date_range'),
    //   name: 'date_range' as Path<FormValues>,
    //   className: classes.dateInput,
    //   maxDate: currentDate.toDate(),
    // },
    {
      inputType: InputTypes.TimeRange,
      label: t('logs.time_range'),
      name: 'time_range' as Path<FormValues>,
      className: classNames(classes.inputSection, classes.dateInput),
      showSeconds: true,
      icon: Alarm,
      rules: {
        validate: timeRangePickerValidator,
      },
    },
  ]

  const selectionFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'department_id',
      ariaLabel: t('logs.select_department'),
      options: departmentFilters,
      placeholder: t('logs.select_department'),
      hideTags: true,
    },
    {
      inputType: InputTypes.Selections,
      name: 'activity',
      ariaLabel: t('logs.select_activity'),
      options: map(EventTypes, (type) => ({
        value: type,
        label: t(`logs.event_type.${type}`),
      })),
      placeholder: t('logs.select_activity'),
      hideTags: true,
      className: classes.inputSection,
    },
  ]

  const toggleSearchFields: FieldProps<FormValues>[] = [
    {
      name: 'last_date',
      tabs: dateTabs,
      className: classes.dateTabsRow,
      dateTabsClassName: classes.dateTabs,
      inputType: InputTypes.ToggleTabs,
    },
    {
      inputType: InputTypes.Text,
      name: 'search',
      ariaLabel: t('placeholder.search'),
      placeholder: t('placeholder.search'),
      className: classes.searchInput,
      inputContainerClassName: classes.searchInnerContainer,
      isSearch: true,
      rules: {
        validate: minLengthValidator,
      },
    },
  ]

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const toggleValue = !!values?.last_date
        ? split(values?.last_date, ' ')
        : []
      const number = toNumber(toggleValue[0] ?? 0)
      const count = isEqual(toggleValue[1], 'hour') ? 'hour' : 'days'

      const formattedCurrentDate = currentDate.format('DD/MM/YYYY')
      const startDate = values?.date_range.start || formattedCurrentDate
      const startTime = values?.time_range.start || currentTime
      const endDate = values?.date_range.end || formattedCurrentDate
      const endTime = values?.time_range.end || currentTime

      if (!values?.last_date) {
        setValue('date_range', { start: startDate, end: endDate })
        setValue('time_range', { start: startTime, end: endTime })
      }

      const startDateTime = !!values?.last_date
        ? currentDate.subtract(number, count)
        : dayjs.utc(`${startDate} ${startTime}`, 'DD/MM/YYYY HH:mm:ss')

      const endDateTime = !!values?.last_date
        ? currentDate
        : dayjs.utc(`${endDate} ${endTime}`, 'DD/MM/YYYY HH:mm:ss')

      const payload = {
        event_type: values?.activity,
        text: values?.search,
        department_id: values?.department_id,
        start_datetime: startDateTime.utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
        end_datetime: endDateTime.utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      }
      setValue('payload', payload)

      try {
        await handleFilterChange(payload)
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [currentDate, currentTime, handleFilterChange, setValue]
  )

  const { date_range, time_range, last_date, search } = watch()

  useEffect(() => {
    if (search && size(search) > 2) {
      handleSubmit(onSubmit)()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    if (!isEmpty(date_range) || !isEmpty(time_range)) {
      setValue('last_date', '')
    }
  }, [date_range, setValue, time_range])

  useEffect(() => {
    if (!!last_date) {
      resetField('date_range')
      resetField('time_range')
    }
  }, [last_date, resetField])

  const handleExportLogs = useCallback(async () => {
    const payload: AuditLogPayloadType = pickBy(
      getValues('payload'),
      (val) => !!val
    )

    try {
      await exportCSV(payload)
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [exportCSV, getValues])

  const resetForm = useCallback(() => {
    reset()
  }, [reset])

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
              ariaLabel={t('logs.clean_fields')}
              size={SizeTypes.S}
              onClick={resetForm}
              appearance={AppearanceTypes.Secondary}
            />
            <Button
              children={t('logs.filter')}
              type="submit"
              ariaLabel={t('logs.filter')}
              size={SizeTypes.S}
              className={classes.filterButton}
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        </div>
        <div className={classes.logsContainer}>
          <DynamicForm fields={dateFields} control={control} />
          <DynamicForm fields={selectionFields} control={control} />
          <DynamicForm
            fields={toggleSearchFields}
            control={control}
            onSubmit={(e) => {
              e.preventDefault()
            }}
          />
        </div>
      </Container>
      <div className={classNames(classes.dateInput, classes.downloadButton)}>
        <Button
          children={t('button.download_csv')}
          type="submit"
          ariaLabel={t('button.download_csv')}
          appearance={AppearanceTypes.Secondary}
          disabled={isEmpty(logsData)}
          onClick={handleExportLogs}
        />
      </div>
      <p
        className={
          isEmpty(logsData) && !isLoading ? classes.noResults : classes.hidden
        }
      >
        {t('logs.no_results_found')}
      </p>
      <LogsTable
        data={logsData}
        hidden={isEmpty(logsData)}
        paginationData={paginationData}
        handlePaginationChange={handlePaginationChange}
      />
    </>
  )
}

export default Logs
