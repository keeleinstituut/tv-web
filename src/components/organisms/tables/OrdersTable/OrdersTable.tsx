import { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, uniq } from 'lodash'
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

// TODO: statuses might come from BE instead
// Currently unclear
const mockStatuses = [
  { label: 'Uus', value: 'NEW' },
  { label: 'Registreeritud', value: 'REGISTERED' },
  { label: 'Tellijale edastatud', value: 'FORWARDED' },
  { label: 'Tühistatud', value: 'CANCELLED' },
  { label: 'Vastuvõetud', value: 'ACCEPTED' },
  { label: 'Tagasi lükatud', value: 'REJECTED' },
]

type OrderTableRow = {
  order_id: string
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

  const {
    orders,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchOrders()

  // TODO: remove default values, once we have actual data
  const orderRows = useMemo(
    () =>
      map(
        orders,
        ({
          id,
          reference_number,
          sub_projects,
          deadline_at,
          order_id = '2021-04-K-13',
          type = { value: 'Tõlkimine + toimetamine' },
          status = 'REGISTERED',
          tags = ['asutusesiseseks kasutuseks'],
          cost = '500€',
        }) => {
          return {
            order_id: order_id || id,
            reference_number,
            deadline_at,
            type: type.value,
            status,
            tags,
            cost,
            language_directions: uniq(
              map(
                sub_projects,
                ({ src_lang, dst_lang }) =>
                  `${src_lang?.value} > ${dst_lang.value}`
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
    columnHelper.accessor('order_id', {
      header: () => t('label.order_id'),
      cell: ({ getValue }) => (
        <Button
          appearance={AppearanceTypes.Text}
          size={SizeTypes.M}
          icon={ArrowRight}
          ariaLabel={t('label.to_order_view')}
          iconPositioning={IconPositioningTypes.Left}
          href={`/orders/${getValue()}`}
        >
          {getValue()}
        </Button>
      ),
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
      cell: ({ getValue }) => {
        const deadlineDate = dayjs(getValue())
        const currentDate = dayjs()
        const diff = deadlineDate.diff(currentDate)
        const formattedDate = dayjs(getValue()).format('DD.MM.YYYY hh:mm')
        return (
          <span
            className={classNames(classes.deadline, diff < 0 && classes.error)}
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
              options={mockStatuses}
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
