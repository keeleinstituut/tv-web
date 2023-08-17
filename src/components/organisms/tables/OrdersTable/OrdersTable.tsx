import { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, uniq, includes, find } from 'lodash'
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
import { useFetchOrders } from 'hooks/requests/useOrders'
import { OrderStatus } from 'types/orders'
import Tag from 'components/atoms/Tag/Tag'
import OrderStatusTag from 'components/molecules/OrderStatusTag/OrderStatusTag'
import dayjs from 'dayjs'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'
import { useFetchTags } from 'hooks/requests/useTags'
import { TagTypes } from 'types/tags'

// TODO: statuses might come from BE instead
// Currently unclear

type OrderTableRow = {
  ext_id: string
  reference_number: string
  deadline_at: string
  type: string
  status: OrderStatus
  tags: string[]
  cost: string
  language_directions: string[]
}

const columnHelper = createColumnHelper<OrderTableRow>()

// TODO: we keep all filtering and sorting options inside form
// This was we can do a new request easily every time form values change
interface FormValues {
  status?: string[]
  own_orders: boolean
}

const OrdersTable: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const {
    orders,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchOrders()
  const { tagsFilters = [] } = useFetchTags({
    type: TagTypes.Order,
  })

  const statusFilters = map(OrderStatus, (status) => ({
    label: t(`orders.status.${status}`),
    value: status,
  }))

  // TODO: remove default values, once we have actual data
  const orderRows = useMemo(
    () =>
      map(
        orders,
        ({
          reference_number,
          sub_projects,
          deadline_at,
          ext_id,
          type_classifier_value,
          status = OrderStatus.Registered,
          tags = ['asutusesiseseks kasutuseks'],
          cost = '500€',
        }) => {
          return {
            ext_id,
            reference_number,
            deadline_at,
            type: type_classifier_value?.value || '',
            status,
            tags,
            cost,
            language_directions: uniq(
              map(
                sub_projects,
                ({
                  source_language_classifier_value,
                  destination_language_classifier_value,
                }) =>
                  `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`
              )
            ),
          }
        }
      ),
    [orders]
  )

  const { control, handleSubmit, watch } = useForm<FormValues>({
    mode: 'onChange',
    resetOptions: {
      keepErrors: true,
    },
  })

  // TODO: use function to pass in filters and sorting to our order fetch hook
  // Not sure yet, what keys these will have and how the params will be passed
  const onSubmit: SubmitHandler<FormValues> = (data) => console.log(data)

  useEffect(() => {
    // Submit form every time it changes
    const subscription = watch(() => handleSubmit(onSubmit)())
    return () => subscription.unsubscribe()
  }, [handleSubmit, watch])

  const columns = [
    columnHelper.accessor('ext_id', {
      header: () => t('label.order_id'),
      cell: ({ getValue, row }) => {
        const orderExtId = getValue()
        const order = find(orders, { ext_id: orderExtId })
        return (
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.M}
            icon={ArrowRight}
            ariaLabel={t('label.to_order_view')}
            iconPositioning={IconPositioningTypes.Left}
            disabled={
              !includes(userPrivileges, Privileges.ViewInstitutionProjectDetail)
            }
            href={`/orders/${order?.id}`}
          >
            {orderExtId}
          </Button>
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('reference_number', {
      header: () => t('label.reference_number'),
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
      meta: {
        filterOption: { tags: tagsFilters },
      },
    }),
    columnHelper.accessor('type', {
      header: () => t('label.type'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('tags', {
      header: () => t('label.order_tags'),
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
          !includes(
            [
              OrderStatus.Forwarded,
              OrderStatus.Accepted,
              OrderStatus.Cancelled,
              OrderStatus.Corrected,
            ],
            rowStatus
          )
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
  ] as ColumnDef<OrderTableRow>[]

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
              name="status"
              control={control}
              options={statusFilters}
              inputType={InputTypes.TagsSelect}
            />
            <FormInput
              name="own_orders"
              label={t('label.show_only_my_orders')}
              ariaLabel={t('label.show_only_my_orders')}
              className={classes.checkbox}
              control={control}
              inputType={InputTypes.Checkbox}
            />
          </div>
        }
      />
    </Root>
  )
}

export default OrdersTable
