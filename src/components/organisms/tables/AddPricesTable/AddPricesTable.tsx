import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { Control, useForm } from 'react-hook-form'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'

import classes from './classes.module.scss'
import CellInput from 'components/organisms/CellInput/CellInput'

export type Skill = {
  id?: string
  name?: string
}

export type Prices = {
  id: string
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  skill: Skill
}

export interface FormValues {
  prices: Prices
}

const AddPricesTable: FC = () => {
  const { t } = useTranslation()

  const pricesData = [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      vendor_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      skill_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      src_lang_classifier_value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      dst_lang_classifier_Value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      updated_at: '2023-08-09T07:48:41.163Z',
      created_at: '2023-08-09T07:48:41.163Z',
      character_fee: 0,
      word_fee: 0,
      page_fee: 0,
      minute_fee: 0,
      hour_fee: 0,
      minimal_fee: 0,
      vendor: 'string',
      source_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        type: 'string',
        value: 'string',
        name: 'ee-ET',
      },
      destination_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        type: 'string',
        value: 'string',
        name: 'en-GB',
      },
      skill: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'Tõlkimine + toimetamine',
      },
    },
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      vendor_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      skill_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      src_lang_classifier_value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      dst_lang_classifier_Value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      updated_at: '2023-08-09T07:48:41.163Z',
      created_at: '2023-08-09T07:48:41.163Z',
      character_fee: 0,
      word_fee: 0,
      page_fee: 0,
      minute_fee: 0,
      hour_fee: 0,
      minimal_fee: 0,
      vendor: 'string',
      source_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
        type: 'string',
        value: 'string',
        name: 'ee-ET',
      },
      destination_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
        type: 'string',
        value: 'string',
        name: 'ru-RU',
      },
      skill: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
        name: 'Terminoloogia töö',
      },
    },
  ]

  const pricesValues = useMemo(() => {
    return (
      map(pricesData, (data) => {
        return {
          id: data.id,
          character_fee: data.character_fee,
          word_fee: data.word_fee,
          page_fee: data.page_fee,
          minute_fee: data.minimal_fee,
          hour_fee: data.hour_fee,
          minimal_fee: data.minimal_fee,
          skill: data.skill.name,
        }
      }) || {}
    )
  }, [])

  const { control, handleSubmit } = useForm<FormValues>({
    reValidateMode: 'onChange',
  })

  const columnHelper = createColumnHelper<Prices>()

  const columns = [
    columnHelper.accessor('skill', {
      header: () => t('vendors.skill'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('character_fee', {
      header: () => t('vendors.character_fee'),
      footer: (info) => info.column.id,
    }),
    // columnHelper.accessor('character_fee', {
    //   header: () => t('vendors.character_fee'),
    //   cell: ({ row }) => {
    //     return (
    //       <CellInput
    //         typedKey={'character_fee'}
    //         ariaLabel={t('vendors.skill')}
    //         rowIndex={row?.index}
    //         control={control}
    //         rowErrors={[]}
    //         errorZIndex={0}
    //       />
    //     )
    //   },
    //   footer: (info) => info.column.id,
    // }),
    columnHelper.accessor('word_fee', {
      header: () => t('vendors.word_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('page_fee', {
      header: () => t('vendors.page_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minute_fee', {
      header: () => t('vendors.minute_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('hour_fee', {
      header: () => t('vendors.hour_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minimal_fee', {
      header: () => t('vendors.minimal_fee'),
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<any>[]

  return (
    <DataTable
      data={pricesValues}
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
