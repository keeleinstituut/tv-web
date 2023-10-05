import { FC, useCallback } from 'react'
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
} from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'

import classes from './classes.module.scss'
import { filter } from 'lodash'
import useValidators from 'hooks/useValidators'

type VendorPricesTableProps = {
  control: Control<FormValues>
  languageDirectionKey: string
  skillId?: string
  typedKey?: string
}

const VendorPricesTable: FC<VendorPricesTableProps> = ({
  control,
  languageDirectionKey,
  skillId,
  typedKey,
}) => {
  const { t } = useTranslation()

  const { priceValidator } = useValidators()

  const columnHelper = createColumnHelper<PriceObject>()

  const rules = {
    required: true,
    validate: (value: unknown) => {
      const typedValue = value as string
      return priceValidator(typedValue)
    },
  }

  const columns = [
    columnHelper.accessor('skill', {
      header: () => t('vendors.skill'),
      cell: ({ getValue }) => {
        const skillName = getValue()
        return <span>{skillName?.name}</span>
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('character_fee', {
      header: () => t('vendors.character_fee'),
      cell: ({ row }) => {
        return (
          <FormInput
            key={row?.index}
            name={`${languageDirectionKey}.priceObject.${row?.original?.skill_id}.character_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.character_fee')}
            className={classes.pricesInput}
            rules={rules}
            errorZIndex={100}
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
            name={`${languageDirectionKey}.priceObject.${row?.original?.skill_id}.word_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.word_fee')}
            className={classes.pricesInput}
            rules={rules}
            errorZIndex={100}
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
            name={`${languageDirectionKey}.priceObject.${row?.original?.skill_id}.page_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.page_fee')}
            className={classes.pricesInput}
            rules={rules}
            errorZIndex={100}
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
            name={`${languageDirectionKey}.priceObject.${row?.original?.skill_id}.minute_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.minute_fee')}
            className={classes.pricesInput}
            rules={rules}
            errorZIndex={100}
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
            name={`${languageDirectionKey}.priceObject.${row?.original?.skill_id}.hour_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.hour_fee')}
            className={classes.pricesInput}
            rules={rules}
            errorZIndex={100}
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
            name={`${languageDirectionKey}.priceObject.${row?.original?.skill_id}.minimal_fee`}
            control={control}
            inputType={InputTypes.Text}
            ariaLabel={t('vendors.minimal_fee')}
            className={classes.pricesInput}
            rules={rules}
            errorZIndex={100}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<PriceObject | unknown>[]

  const languageDirectionPrices = useWatch({ control })

  const languageDirectionObject =
    languageDirectionPrices[languageDirectionKey] || {}

  const filteredData = filter(
    languageDirectionObject.priceObject,
    skillId ? languageDirectionObject?.priceObject?.[skillId] : 'isSelected'
  )

  const paginationData = {
    per_page: filteredData?.length,
    current_page: 1,
    total: filteredData?.length,
  }

  return (
    <DataTable
      data={filteredData}
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

export default VendorPricesTable
