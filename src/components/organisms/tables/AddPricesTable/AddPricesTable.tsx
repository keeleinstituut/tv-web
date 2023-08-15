import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { filter, map, mapKeys } from 'lodash'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { Control } from 'react-hook-form'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'

import classes from './classes.module.scss'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import {
  FormValues,
  Prices,
} from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import { useFetchSkills } from 'hooks/requests/useVendors'

export type Skill = {
  id?: string
  name?: string
}

type AddPrices = Omit<Prices, 'language_direction'>

type AddPricesTableProps = {
  control: Control<FormValues>
  selectedSkills?: { [key: string]: boolean } | undefined
}

const AddPricesTable: FC<AddPricesTableProps> = ({
  selectedSkills = {},
  control,
}) => {
  const { t } = useTranslation()

  const { data: skillsData } = useFetchSkills()

  const transformedData = mapKeys(selectedSkills, (value, key) => {
    const keyWithoutNumber = key.replace(/_\d+$/, '')
    return keyWithoutNumber
  })

  const matchingSkills = filter(
    skillsData,
    (skill) => transformedData[skill.id]
  )

  const skillsLabels = map(matchingSkills, ({ name }) => {
    return { skill_id: name }
  })

  const columnHelper = createColumnHelper<AddPrices>()

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
            name={`character_fee-${row?.index}`}
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
            name={`word_fee-${row?.index}`}
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
            name={`page_fee-${row?.index}`}
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
            name={`minute_fee-${row?.index}`}
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
            name={`hour_fee-${row?.index}`}
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
            name={`minimal_fee-${row?.index}`}
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
  ] as ColumnDef<any>[]

  return (
    <DataTable
      data={skillsLabels}
      columns={columns}
      tableSize={TableSizeTypes.M}
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

export default AddPricesTable
