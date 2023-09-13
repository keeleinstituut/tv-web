import { FC, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, includes, find } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import classNames from 'classnames'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import classes from './classes.module.scss'
import { Root } from '@radix-ui/react-form'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useFetchSubOrders } from 'hooks/requests/useOrders'
import { SubOrderStatus } from 'types/orders'
import Tag from 'components/atoms/Tag/Tag'
import OrderStatusTag from 'components/molecules/OrderStatusTag/OrderStatusTag'
import dayjs from 'dayjs'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'

// TODO: this component is very similar to OrdersTable
// Some fields seem to be missing for SubOrders though, so not sure yet, which parts
// will be shared between this and OrdersTable.
// For now let's keep them separate, but they can be unified into 1 component or they should at least use some shared part later on

type SubOrderTableRow = {
  ext_id: string
  reference_number: string
  deadline_at: string
  type: string
  status?: SubOrderStatus
  cost?: string
  language_directions: string[]
}

const columnHelper = createColumnHelper<SubOrderTableRow>()

interface FormValues {
  statuses?: SubOrderStatus[]
  only_show_personal_projects: boolean
  ext_id?: string
}

const SubOrdersTable: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const {
    subOrders,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchSubOrders()

  const statusFilters = map(SubOrderStatus, (status) => ({
    label: t(`orders.status.${status}`),
    value: status,
  }))

  // TODO: remove hardcoded default values, once we have actual data
  const orderRows = useMemo(
    () =>
      map(
        subOrders,
        ({
          reference_number,
          deadline_at,
          ext_id,
          type_classifier_value,
          source_language_classifier_value,
          destination_language_classifier_value,
          status,
          cost,
        }) => {
          return {
            ext_id,
            reference_number,
            deadline_at,
            type: type_classifier_value?.value || '',
            status,
            cost,
            language_directions: [
              `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`,
            ],
          }
        }
      ),
    [subOrders]
  )

  const { control, handleSubmit, watch } = useForm<FormValues>({
    mode: 'onChange',
    resetOptions: {
      keepErrors: true,
    },
  })

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    (payload) => {
      handleFilterChange({
        ...payload,
      })
    },
    [handleFilterChange]
  )

  useEffect(() => {
    // Submit form every time it changes
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [handleSubmit, onSubmit, watch])

  const columns = [
    columnHelper.accessor('ext_id', {
      header: () => t('label.sub_order_id'),
      cell: ({ getValue }) => {
        const orderExtId = getValue()
        const subOrder = find(subOrders, { ext_id: orderExtId })
        const parentOrderId = subOrder?.project_id
        return (
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.M}
            icon={ArrowRight}
            ariaLabel={t('label.to_order_view')}
            iconPositioning={IconPositioningTypes.Left}
            disabled={!includes(userPrivileges, Privileges.ViewPersonalProject)}
            href={`/orders/${parentOrderId}#${orderExtId}`}
          >
            {orderExtId}
          </Button>
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('reference_number', {
      header: () => t('label.associated_reference_number'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('language_directions', {
      header: () => t('label.language_directions'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return (
          <div className={classes.tagsRow}>
            {map(getValue(), (value) => (
              <Tag label={value} value key={value} />
            ))}
          </div>
        )
      },
    }),
    columnHelper.accessor('type', {
      header: () => t('label.type'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('status', {
      header: () => t('label.status'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => <OrderStatusTag status={getValue()} />,
    }),
    columnHelper.accessor('cost', {
      header: () => t('label.cost'),
      footer: (info) => info.column.id,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
    columnHelper.accessor('deadline_at', {
      header: () => t('label.deadline_at'),
      footer: (info) => info.column.id,
      cell: ({ getValue, row }) => {
        const deadlineDate = dayjs(getValue())
        const currentDate = dayjs()
        const diff = deadlineDate.diff(currentDate)
        const formattedDate = dayjs(getValue()).format('DD.MM.YYYY HH:mm')
        const rowStatus = row.original.status
        const hasDeadlineError =
          diff < 0 &&
          !includes([SubOrderStatus.Done, SubOrderStatus.Cancelled], rowStatus)
        return (
          <span
            className={classNames(
              classes.deadline,
              hasDeadlineError && classes.error
            )}
          >
            {formattedDate}
          </span>
        )
      },
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
  ] as ColumnDef<SubOrderTableRow>[]

  return (
    <Root>
      <DataTable
        data={orderRows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        onFiltersChange={handleFilterChange}
        onSortingChange={handleSortingChange}
        headComponent={
          <div className={classes.topSection}>
            <FormInput
              name="statuses"
              control={control}
              options={statusFilters}
              inputType={InputTypes.TagsSelect}
            />
            <FormInput
              name="only_show_personal_projects"
              label={t('label.show_only_my_orders')}
              ariaLabel={t('label.show_only_my_orders')}
              className={classes.checkbox}
              control={control}
              inputType={InputTypes.Checkbox}
            />
            <FormInput
              name="ext_id"
              ariaLabel={t('label.search_by_id')}
              placeholder={t('placeholder.search_by_id')}
              inputType={InputTypes.Text}
              className={classes.searchInput}
              inputContainerClassName={classes.searchInnerContainer}
              control={control}
              isSearch
            />
          </div>
        }
      />
    </Root>
  )
}

export default SubOrdersTable
