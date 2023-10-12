import { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { chain, find, isEmpty, map, reduce, some } from 'lodash'
import { Root } from '@radix-ui/react-form'
import { useAllPricesFetch, useFetchSkills } from 'hooks/requests/useVendors'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { useForm } from 'react-hook-form'
import { ColumnDef, Row, createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { VendorFormProps } from 'components/organisms/forms/VendorForm/VendorForm'
import VendorPriceManagementButton from 'components/organisms/VendorPriceManagementButton/VendorPriceManagementButton'
import DeleteVendorPriceButton from 'components/organisms/DeleteVendorPriceButton/DeleteVendorPriceButton'

import classes from './classes.module.scss'

export type FormValues = {
  [key in string]: {
    src_lang_classifier_value_id?: { name: string; id: string }
    dst_lang_classifier_value_id?: { name: string; id: string }
    skill_id?: { [key: string]: boolean }
    priceObject?: { [key in string]: PriceObject }
  }
}

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

const VendorPriceListForm: FC<VendorFormProps> = ({ vendor }) => {
  const { t } = useTranslation()

  const { skills: skillsData } = useFetchSkills()
  const { id: vendor_id } = vendor

  const {
    prices: pricesData,
    paginationData,
    handlePaginationChange,
  } = useAllPricesFetch({
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
  }, [pricesData])

  const defaultFormValues: FormValues = useMemo(
    () =>
      reduce(
        groupedLanguagePairData,
        (result, value) => {
          return {
            ...result,
            [`${value.subRows[0].source_language_classifier_value.id}_${value.subRows[0].destination_language_classifier_value.id}`]:
              {
                src_lang_classifier_value_id:
                  value.subRows[0].source_language_classifier_value,
                dst_lang_classifier_value_id:
                  value.subRows[0].destination_language_classifier_value,
                priceObject: reduce(
                  skillsData,
                  (result, skillData) => {
                    const skillPrice = find(value.subRows, {
                      skill_id: skillData.id,
                    })
                    return {
                      ...result,
                      [skillData.id]: {
                        isSelected: some(value.subRows, {
                          skill_id: skillData.id,
                        }),
                        skill_id: skillData.id,
                        skill: skillData,
                        character_fee: skillPrice?.character_fee || `${0}`,
                        hour_fee: skillPrice?.hour_fee || `${0}`,
                        minimal_fee: skillPrice?.minimal_fee || `${0}`,
                        minute_fee: skillPrice?.minute_fee || `${0}`,
                        page_fee: skillPrice?.page_fee || `${0}`,
                        word_fee: skillPrice?.word_fee || `${0}`,
                        id: skillPrice?.id,
                      },
                    }
                  },
                  {}
                ),
              },
          }
        },
        {}
      ),
    [groupedLanguagePairData, skillsData]
  )

  const newPriceObject = {
    new: {
      priceObject: reduce(
        skillsData,
        (result, skillData) => {
          return {
            ...result,
            [skillData.id]: {
              isSelected: false,
              skill_id: skillData.id,
              skill: skillData,
              character_fee: `${0}`,
              hour_fee: `${0}`,
              minimal_fee: `${0}`,
              minute_fee: `${0}`,
              page_fee: `${0}`,
              word_fee: `${0}`,
            },
          }
        },
        {}
      ),
    },
  }

  const { handleSubmit, control, reset, setError, getValues } =
    useForm<FormValues>({
      values: { ...defaultFormValues, ...newPriceObject },
      mode: 'onTouched',
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
        const defaultLanguagePairValues =
          defaultFormValues[languageDirectionKey]

        return (
          <div className={classes.iconsContainer}>
            <VendorPriceManagementButton
              languageDirectionKey={languageDirectionKey}
              skillId={skillId}
              control={control}
              handleSubmit={handleSubmit}
              vendorId={vendor_id}
              resetForm={resetForm}
              setError={setError}
              defaultLanguagePairValues={defaultLanguagePairValues}
              getValues={getValues}
            />
            <DeleteVendorPriceButton
              languagePairIds={languagePairIds}
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
              <VendorPriceManagementButton
                languageDirectionKey="new"
                control={control}
                handleSubmit={handleSubmit}
                vendorId={vendor_id}
                resetForm={resetForm}
                setError={setError}
                getValues={getValues}
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
