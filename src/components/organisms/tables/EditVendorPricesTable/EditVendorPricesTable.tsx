import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { Control, useWatch } from 'react-hook-form'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import {
  FormValues,
  PriceObject,
  Prices,
} from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'

import classes from './classes.module.scss'

export type Skill = {
  id?: string
  name?: string
}

export type AddPrices = Omit<Prices, 'language_direction'>

type AddPricesTableProps = {
  control: Control<FormValues>
  editableSkill: PriceObject[]
}

const EditVendorPricesTable: FC<AddPricesTableProps> = ({
  control,
  editableSkill,
}) => {
  const { t } = useTranslation()

  console.log('editableSkill Table', editableSkill)

  const columnHelper = createColumnHelper<PriceObject>()

  const columns = [
    columnHelper.accessor('skill_id', {
      header: () => t('vendors.skill'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('character_fee', {
      header: () => t('vendors.character_fee'),
      cell: ({ row }) => {
        return (
          <FormInput
            key={row?.index}
            name={'priceObject.character_fee'}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.character_fee')}
            type="number"
            className={classes.pricesInput}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('word_fee', {
      header: () => t('vendors.word_fee'),
      cell: ({ row }) => {
        return (
          <FormInput
            key={row?.index}
            name={'priceObject.word_fee'}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.word_fee')}
            type="number"
            className={classes.pricesInput}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('page_fee', {
      header: () => t('vendors.page_fee'),
      cell: ({ row }) => {
        return (
          <FormInput
            key={row?.index}
            name={'priceObject.page_fee'}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.page_fee')}
            type="number"
            className={classes.pricesInput}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minute_fee', {
      header: () => t('vendors.minute_fee'),
      cell: ({ row }) => {
        return (
          <FormInput
            key={row?.index}
            name={'priceObject.minute_fee'}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.minute_fee')}
            type="number"
            className={classes.pricesInput}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('hour_fee', {
      header: () => t('vendors.hour_fee'),
      cell: ({ row }) => {
        return (
          <FormInput
            key={row?.index}
            name={'priceObject.hour_fee'}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.hour_fee')}
            type="number"
            className={classes.pricesInput}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minimal_fee', {
      header: () => t('vendors.minimal_fee'),
      cell: ({ row }) => {
        return (
          <FormInput
            key={row?.index}
            name={'priceObject.minimal_fee'}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.minimal_fee')}
            type="number"
            className={classes.pricesInput}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<PriceObject>[]

  const formValues = useWatch({ control })
  console.log('formValues Edit', formValues)

  return (
    <DataTable
      data={editableSkill}
      columns={columns}
      tableSize={TableSizeTypes.L}
      hidePagination
      title={
        <div className={classes.pricesTitleContainer}>
          <h4 className={classes.pricesTitle}>{t('vendors.prices')}</h4>
          <span className={classes.currency}>{t('vendors.eur')}</span>
        </div>
      }
      className={classes.priceListContainer}
    />
  )
}

export default EditVendorPricesTable
