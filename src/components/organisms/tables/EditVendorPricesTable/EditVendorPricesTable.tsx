import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { Control } from 'react-hook-form'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import {
  FormValues,
  PriceObject,
} from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'

import classes from './classes.module.scss'

type EditPricesTableProps = {
  control: Control<FormValues>
  editableSkills: PriceObject[]
}

const EditVendorPricesTable: FC<EditPricesTableProps> = ({
  control,
  editableSkills,
}) => {
  const { t } = useTranslation()

  const columnHelper = createColumnHelper<PriceObject>()

  console.log('editableSkills prices table', editableSkills)

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
            name={`priceObject.${row?.original?.id}.character_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.character_fee')}
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
            name={`priceObject.${row?.original?.id}.word_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.word_fee')}
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
            name={`priceObject.${row?.original?.id}.page_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.page_fee')}
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
            name={`priceObject.${row?.original?.id}.minute_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.minute_fee')}
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
            name={`priceObject.${row?.original?.id}.hour_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.hour_fee')}
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
            name={`priceObject.${row?.original?.id}.minimal_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.minimal_fee')}
            className={classes.pricesInput}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<PriceObject>[]

  const paginationData = {
    per_page: editableSkills?.length,
    current_page: 1,
    total: editableSkills?.length,
  }

  return (
    <DataTable
      data={editableSkills}
      columns={columns}
      tableSize={TableSizeTypes.L}
      hidePagination
      paginationData={paginationData}
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
