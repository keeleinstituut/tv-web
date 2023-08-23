import { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { chain, includes, isEmpty } from 'lodash'
import { Root } from '@radix-ui/react-form'
import { useFetchPrices, useFetchSkills } from 'hooks/requests/useVendors'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { useForm } from 'react-hook-form'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { VendorFormProps } from '../VendorForm/VendorForm'
import EditVendorPriceModalButton from 'components/organisms/EditVendorPriceModalButton/EditVendorPriceModalButton'
import AddVendorPriceModalButton from 'components/organisms/AddVendorPriceModalButton/AddVendorPriceModalButton'

import classes from './classes.module.scss'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'

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
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
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

const VendorPriceListForm: FC<VendorFormProps> = ({ vendor }) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const { data: skillsData } = useFetchSkills()
  const { id: vendor_id } = vendor

  const {
    prices: pricesData,
    paginationData,
    handlePaginationChange,
  } = useFetchPrices({
    vendor_id,
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
          subRows: items,
        }
      })
      .value()
  }, [pricesData])

  const { handleSubmit, control, reset, setValue } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: {},
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
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (row.getCanExpand()) {
            row.toggleExpanded(true)
          }
        }, [row])

        const languageDirection = row.original.language_direction

        return (
          <>
            {row.getCanExpand() && (
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
      },
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
              hidden={!includes(userPrivileges, Privileges.EditVendorDb)}
            />
            <Button
              appearance={AppearanceTypes.Text}
              icon={Delete}
              ariaLabel={t('vendors.delete')}
              className={classes.deleteIcon}
              // handle delete
            />
          </div>
        )
      },
    }),
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
              {t('vendors.vendor_price_list_title')}
              <AddVendorPriceModalButton
                vendorId={vendor_id}
                control={control}
                handleSubmit={handleSubmit}
                resetForm={resetForm}
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
