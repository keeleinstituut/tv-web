import { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { chain, isEmpty, map, toString } from 'lodash'
import { Root } from '@radix-ui/react-form'
import { useFetchPrices, useFetchSkills } from 'hooks/requests/useVendors'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { useForm } from 'react-hook-form'
import { ColumnDef, Row, createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { VendorFormProps } from '../VendorForm/VendorForm'
import EditVendorPriceModalButton from 'components/organisms/EditVendorPriceModalButton/EditVendorPriceModalButton'
import AddVendorPriceModalButton from 'components/organisms/AddVendorPriceModalButton/AddVendorPriceModalButton'
import DeleteVendorPriceButton from 'components/organisms/DeleteVendorPriceButton/DeleteVendorPriceButton'
import { OrderDirection } from 'types/vendors'

import classes from './classes.module.scss'

export type FormValues = {
  src_lang_classifier_value_id?: string
  dst_lang_classifier_value_id?: string
  skill_id?: { [key: string]: boolean }
  priceObject?: PriceObject[]
} & {
  [key: string]: number | string | undefined
}

export type PriceObject = {
  id: string
  character_fee: number | string
  word_fee: number | string
  page_fee: number | string
  minute_fee: number | string
  hour_fee: number | string
  minimal_fee: number | string
  skill_id: string
  skill?: { id: string; name: string }
  language_direction?: string
  source_language_classifier_value?: {
    name: string
  }
  destination_language_classifier_value?: {
    name: string
  }
  subRows?: PriceObject[]
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

const VendorPriceListForm: FC<VendorFormProps> = ({ vendor }) => {
  const { t } = useTranslation()

  const { data: skillsData } = useFetchSkills()
  const { id: vendor_id } = vendor

  const {
    prices: pricesData,
    paginationData,
    handlePaginationChange,
  } = useFetchPrices({
    vendor_id,
    order_direction: OrderDirection.Asc,
  })

  const priceListCreated = dayjs(
    pricesData ? pricesData[0]?.created_at : ''
  ).format('DD.MM.YYYY hh:mm')
  const priceListUpdated = dayjs(
    pricesData ? pricesData[0]?.updated_at : ''
  ).format('DD.MM.YYYY hh:mm')

  const groupedLanguagePairData = useMemo(() => {
    return chain(pricesData)
      .groupBy(
        (item) =>
          `${item.src_lang_classifier_value_id}.${item.dst_lang_classifier_value_id}`
      )
      .map((items) => {
        return {
          language_direction: `${items[0].source_language_classifier_value.name} > ${items[0].destination_language_classifier_value.name} `,
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
                character_fee: `${toString(character_fee)}€`,
                hour_fee: `${toString(hour_fee)}€`,
                minimal_fee: `${toString(minimal_fee)}€`,
                minute_fee: `${toString(minute_fee)}€`,
                page_fee: `${toString(page_fee)}€`,
                word_fee: `${toString(word_fee)}€`,
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
  }, [pricesData])

  const { handleSubmit, control, reset, setValue, setError } =
    useForm<FormValues>({
      defaultValues: {},
      mode: 'onChange',
    })

  const resetForm = useCallback(() => {
    reset()
  }, [reset])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const columnHelper = createColumnHelper<PriceObject>()

  const columns = [
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
      footer: (info) => info.column.id,
    }),
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
    columnHelper.accessor('id', {
      header: () => <></>,
      cell: ({ row }) => {
        const languagePairModalContent = !row.originalSubRows
          ? [row.original]
          : row.original.subRows || []

        return (
          <div className={classes.iconsContainer}>
            <EditVendorPriceModalButton
              languagePairModalContent={languagePairModalContent}
              control={control}
              setValue={setValue}
              handleSubmit={handleSubmit}
              vendorId={vendor_id}
              resetForm={resetForm}
              setError={setError}
            />
            <DeleteVendorPriceButton
              languagePairModalContent={languagePairModalContent}
              vendorId={vendor_id}
            />
          </div>
        )
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as ColumnDef<any>[]

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
              <AddVendorPriceModalButton
                vendorId={vendor_id}
                control={control}
                handleSubmit={handleSubmit}
                resetForm={resetForm}
                setError={setError}
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
