import { useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Control, FieldValues, Path } from 'react-hook-form/dist/types'
import {
  DiscountPercentageNames,
  DiscountPercentagesAmountNames,
} from 'types/vendors'
import DisplayValue from 'components/molecules/DisplayValue/DisplayValue'
import { map, sum, toNumber, values, round } from 'lodash'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'

import classes from './classes.module.scss'
import { useWatch } from 'react-hook-form'
import classNames from 'classnames'

interface TotalPriceProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>
}

const TotalPrice = <TFormValues extends FieldValues>({
  control,
}: TotalPriceProps<TFormValues>) => {
  const amountValues = useWatch({
    control,
    name: values(DiscountPercentagesAmountNames) as Path<TFormValues>[],
  })

  const value = round(sum(map(amountValues, (v) => Number(v))), 3)

  return <DisplayValue value={value} />
}

interface RowPriceProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>
  name: string
}

const RowPrice = <TFormValues extends FieldValues>({
  control,
  name,
}: RowPriceProps<TFormValues>) => {
  const unitPrice = useWatch({
    control,
    name: 'unit_fee' as Path<TFormValues>,
  })
  const amountValue = useWatch({
    control,
    name: (name + '_amount') as Path<TFormValues>,
  })
  const discountValue = useWatch({
    control,
    name: name as Path<TFormValues>,
  })

  const value = useMemo(
    () =>
      ((100 - toNumber(discountValue ?? 0)) / 100) *
      toNumber(amountValue ?? 0) *
      toNumber(unitPrice ?? 0),
    [amountValue, discountValue, unitPrice]
  )

  return <DisplayValue value={value} />
}

interface VolumeCatPriceTableProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>
  hidden?: boolean
  isEditable?: boolean
  taskViewPricesClass?: string
}

interface TableRow {
  match_type: string
  percent_from_price?: DiscountPercentageNames
  price: string
  amount: string
}

const columnHelper = createColumnHelper<TableRow>()

const VolumeCatPriceTable = <TFormValues extends FieldValues>({
  control,
  hidden,
  isEditable,
  taskViewPricesClass,
}: VolumeCatPriceTableProps<TFormValues>) => {
  const { t } = useTranslation()

  type PercentageRow = {
    label: string
    name: DiscountPercentageNames
  }

  const percentages: PercentageRow[] = useMemo(
    () => [
      { label: '101%', name: DiscountPercentageNames.DP_101 },
      {
        label: t('vendors.repetitions'),
        name: DiscountPercentageNames.DP_repetitions,
      },
      { label: '100%', name: DiscountPercentageNames.DP_100 },
      { label: '95-99%', name: DiscountPercentageNames.DP_95_99 },
      { label: '85-94%', name: DiscountPercentageNames.DP_85_94 },
      { label: '75-84%', name: DiscountPercentageNames.DP_75_84 },
      { label: '50-74%', name: DiscountPercentageNames.DP_50_74 },
      { label: '0-49%', name: DiscountPercentageNames.DP_0_49 },
    ],
    [t]
  )

  const rows = useMemo(
    () => [
      ...map(percentages, ({ label, name }) => ({
        match_type: label,
        percent_from_price: name,
        price: name,
        amount: name,
      })),
      {
        match_type: '',
        percent_from_price: undefined,
        price: 'kokku',
        amount: 'kokku',
      },
    ],
    [percentages]
  )

  const columns = [
    columnHelper.accessor('match_type', {
      header: () => t('label.match_type'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('percent_from_price', {
      header: () => t('label.percent_from_price'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const discountPercentageKey = getValue()
        if (!discountPercentageKey) return null
        return (
          <FormInput
            name={`${discountPercentageKey}` as Path<TFormValues>}
            ariaLabel={t('label.enter_discount_percentage')}
            placeholder={'0,00'}
            control={control}
            inputType={InputTypes.Text}
            className={classes.input}
            type="number"
            onlyDisplay={!isEditable}
          />
        )
      },
    }),
    columnHelper.accessor('price', {
      header: () => t('label.price'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const discountPercentageKey = getValue()
        if (discountPercentageKey === 'kokku') return t('table.total')
        return <RowPrice control={control} name={discountPercentageKey} />
      },
    }),
    columnHelper.accessor('amount', {
      header: () => t('label.amount'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const discountPercentageKey = getValue()
        if (discountPercentageKey === 'kokku') {
          return <TotalPrice control={control} />
        }
        return (
          <FormInput
            name={`${discountPercentageKey}_amount` as Path<TFormValues>}
            ariaLabel={t('label.amount')}
            placeholder={'0'}
            control={control}
            inputType={InputTypes.Text}
            className={classes.input}
            type="number"
            onlyDisplay={!isEditable}
          />
        )
      },
    }),
  ] as ColumnDef<TableRow>[]

  if (hidden) return null

  return (
    <DataTable
      data={rows}
      columns={columns}
      tableSize={TableSizeTypes.M}
      className={classNames(classes.tableContainer, taskViewPricesClass)}
      hidePagination
      headComponent={
        <h2 className={classes.tableTitle}>
          {t('modal.calculation_by_analysis')}
        </h2>
      }
    />
  )
}

export default memo(VolumeCatPriceTable) as typeof VolumeCatPriceTable
