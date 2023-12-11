import { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { chain, isEmpty, map, orderBy } from 'lodash'
import { Root } from '@radix-ui/react-form'
import { useAllPricesFetch, useFetchSkills } from 'hooks/requests/useVendors'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { ColumnDef, Row, createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { VendorFormProps } from 'components/organisms/forms/VendorForm/VendorForm'
import VendorPriceManagementButton from 'components/organisms/VendorPriceManagementButton/VendorPriceManagementButton'
import DeleteVendorPriceButton from 'components/organisms/DeleteVendorPriceButton/DeleteVendorPriceButton'

import classes from './classes.module.scss'

export type PriceObject = {
  id: string
  isSelected?: boolean
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  skill_id: string
  skill: { id: string; name: string }
  language_direction?: string
  language_direction_key?: string
  source_language_classifier_value?: {
    name: string
    id?: string
  }
  destination_language_classifier_value?: {
    name: string
    id?: string
  }
  subRows: PriceObject[]
}

export type LanguageDirectionCellProps = {
  row: Row<PriceObject>
}

const LanguageDirectionCell: FC<LanguageDirectionCellProps> = ({ row }) => {
  const canExpand = row?.getCanExpand() ?? false
  const languageDirection = row?.original?.language_direction

  useEffect(() => {
    if (canExpand) {
      row.toggleExpanded(true)
    }
  }, [canExpand, row])

  return (
    <>
      {canExpand && (
        <Button
          onClick={() => row.toggleExpanded()}
          appearance={AppearanceTypes.Text}
          hidden
        />
      )}
      <p className={languageDirection && classes.languageTag}>
        {languageDirection}
      </p>
    </>
  )
}

const columnHelper = createColumnHelper<PriceObject>()

const VendorPriceListForm: FC<VendorFormProps> = ({ vendor }) => {
  const { t } = useTranslation()

  const { skills: skillsData } = useFetchSkills()
  const { id: vendor_id } = vendor

  const {
    prices: pricesData,
    paginationData,
    handlePaginationChange,
    filters,
  } = useAllPricesFetch({
    vendor_id,
    sort_by: 'lang_pair',
    sort_order: 'asc',
  })

  const orderedList = orderBy(
    pricesData,
    ['dst_lang_classifier_value.name'],
    ['desc']
  )

  const priceListCreated = dayjs(
    orderedList ? orderedList[0]?.created_at : ''
  ).format('DD.MM.YYYY hh:mm')
  const priceListUpdated = dayjs(
    orderedList ? orderedList[0]?.updated_at : ''
  ).format('DD.MM.YYYY hh:mm')

  const groupedLanguagePairData = useMemo(() => {
    return chain(orderedList)
      .groupBy(
        (item) =>
          `${item.src_lang_classifier_value_id}.${item.dst_lang_classifier_value_id}`
      )
      .map((items) => {
        return {
          language_direction: `${items[0].source_language_classifier_value.name} > ${items[0].destination_language_classifier_value.name}`,
          language_direction_key: `${items[0].source_language_classifier_value.id}_${items[0].destination_language_classifier_value.id}`,
          subRows: map(
            items,
            ({
              character_fee,
              hour_fee,
              minimal_fee,
              minute_fee,
              page_fee,
              word_fee,
              skill_id,
              skill,
              source_language_classifier_value,
              destination_language_classifier_value,
              id,
            }) => {
              return {
                language_direction_key: `${items[0].source_language_classifier_value.id}_${items[0].destination_language_classifier_value.id}`,
                character_fee,
                hour_fee,
                minimal_fee,
                minute_fee,
                page_fee,
                word_fee,
                skill_id,
                skill,
                source_language_classifier_value,
                destination_language_classifier_value,
                id,
              }
            }
          ),
        }
      })
      .value()
  }, [orderedList])

  const columns = useMemo(
    () => [
      columnHelper.accessor('language_direction', {
        header: () => t('vendors.language_direction'),
        cell: ({ row }) => <LanguageDirectionCell row={row} />,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('skill_id', {
        header: () => t('vendors.skill'),
        cell: ({ getValue }) => {
          const skillName = skillsData?.find((skill) => skill.id === getValue())
          return <p>{skillName?.name}</p>
        },
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('character_fee', {
        header: () => t('vendors.character_fee'),
        cell: ({ getValue }) =>
          getValue() !== undefined ? `${getValue()}€` : null,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('word_fee', {
        header: () => t('vendors.word_fee'),
        cell: ({ getValue }) =>
          getValue() !== undefined ? `${getValue()}€` : null,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('page_fee', {
        header: () => t('vendors.page_fee'),
        cell: ({ getValue }) =>
          getValue() !== undefined ? `${getValue()}€` : null,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('minute_fee', {
        header: () => t('vendors.minute_fee'),
        cell: ({ getValue }) =>
          getValue() !== undefined ? `${getValue()}€` : null,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('hour_fee', {
        header: () => t('vendors.hour_fee'),
        cell: ({ getValue }) =>
          getValue() !== undefined ? `${getValue()}€` : null,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('minimal_fee', {
        header: () => t('vendors.minimal_fee'),
        cell: ({ getValue }) =>
          getValue() !== undefined ? `${getValue()}€` : null,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('id', {
        header: () => <></>,
        cell: ({ row }) => {
          const languageDirectionKey = row.original.language_direction_key || ''
          const skillId = row.original.skill_id || ''
          const subRowsIds = map(row.original.subRows, ({ id }) => id)
          const languagePairIds = skillId ? [row.original.id] : subRowsIds

          return (
            <div className={classes.iconsContainer}>
              <VendorPriceManagementButton
                languageDirectionKey={languageDirectionKey}
                filters={filters}
                skillId={skillId}
                vendor_id={vendor_id}
              />
              <DeleteVendorPriceButton
                languagePairIds={languagePairIds}
                vendor_id={vendor_id}
              />
            </div>
          )
        },
      }),
    ],
    [filters, skillsData, t, vendor_id]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as ColumnDef<any>[]

  return (
    <>
      <Root>
        <DataTable
          data={groupedLanguagePairData}
          getSubRows={(originalRow) => originalRow.subRows}
          columns={columns}
          tableSize={TableSizeTypes.M}
          className={
            !isEmpty(groupedLanguagePairData)
              ? classes.vendorPricesContainer
              : classes.hiddenVendorPrices
          }
          paginationData={paginationData}
          onPaginationChange={handlePaginationChange}
          title={
            <div className={classes.pricesDataTableHeader}>
              <h4>{t('vendors.vendor_price_list_title')}</h4>
              <VendorPriceManagementButton
                languageDirectionKey="new"
                filters={filters}
                vendor_id={vendor_id}
              />
            </div>
          }
        />
      </Root>

      <p className={classes.dateText}>
        {t('vendors.price_list_created', { priceListCreated })}
      </p>
      <p className={classes.dateText}>
        {t('vendors.price_list_updated_at', { priceListUpdated })}
      </p>
    </>
  )
}

export default VendorPriceListForm
