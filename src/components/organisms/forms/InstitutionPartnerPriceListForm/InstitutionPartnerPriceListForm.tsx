import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { chain, isEmpty, map, orderBy } from 'lodash'
import { Root } from '@radix-ui/react-form'
import {
  useAllInstitutionPartnerPricesFetch,
} from 'hooks/requests/useInstitutionPartners'
import { useFetchSkills } from 'hooks/requests/useVendors'
import LanguageDirectionCell from 'components/molecules/LanguageDirectionCell/LanguageDirectionCell'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { InstitutionPartner } from 'types/outsourceRequests'
import { PriceObject } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import InstitutionPartnerPriceManagementButton from 'components/organisms/InstitutionPartnerPriceManagementButton/InstitutionPartnerPriceManagementButton'
import DeleteInstitutionPartnerPriceButton from 'components/organisms/DeleteInstitutionPartnerPriceButton/DeleteInstitutionPartnerPriceButton'

import classes from './classes.module.scss'
import { useSearchParams } from 'react-router-dom'


const columnHelper = createColumnHelper<PriceObject>()

export type InstitutionPartnerPriceListFormProps = {
  institutionPartner: InstitutionPartner
}

const InstitutionPartnerPriceListForm: FC<InstitutionPartnerPriceListFormProps> = ({
  institutionPartner,
}) => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const { skills: skillsData } = useFetchSkills()
  const { id: institution_partner_id } = institutionPartner

  const initialFilters = {
    ...Object.fromEntries(searchParams.entries()),
    institution_partner_id,
  }

  const {
    prices: pricesData,
    dates: priceListDates,
    paginationData,
    handlePaginationChange,
    filters,
  } = useAllInstitutionPartnerPricesFetch({
    initialFilters: {
      ...initialFilters,
      ...{ sort_by: 'lang_pair', sort_order: 'asc' },
      per_page: 10,
      page: 1,
    },
    saveQueryParams: true,
  })

  const orderedList = orderBy(
    pricesData,
    ['dst_lang_classifier_value.name'],
    ['desc']
  )

  const defaultPaginationData = {
    per_page: Number(filters.per_page),
    page: Number(filters.page) - 1,
  }

  const showDates =
    priceListDates?.min_created_at && priceListDates?.max_updated_at

  const priceListCreated = dayjs(priceListDates?.min_created_at).format(
    'DD.MM.YYYY hh:mm'
  )
  const priceListUpdated = dayjs(priceListDates?.max_updated_at).format(
    'DD.MM.YYYY hh:mm'
  )

  const groupedLanguagePairData = useMemo(() => {
    return chain(orderedList)
      .groupBy(
        (item) =>
          `${item.src_lang_classifier_value_id}.${item.dst_lang_classifier_value_id}`
      )
      .map((items) => {
        return {
          language_direction: `${items[0].source_language_classifier_value?.name} > ${items[0].destination_language_classifier_value?.name}`,
          language_direction_key: `${items[0].source_language_classifier_value?.id}_${items[0].destination_language_classifier_value?.id}`,
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
                language_direction_key: `${items[0].source_language_classifier_value?.id}_${items[0].destination_language_classifier_value?.id}`,
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
              <InstitutionPartnerPriceManagementButton
                languageDirectionKey={languageDirectionKey}
                filters={filters}
                skillId={skillId}
                institution_partner_id={institution_partner_id}
              />
              <DeleteInstitutionPartnerPriceButton
                languagePairIds={languagePairIds}
                institution_partner_id={institution_partner_id}
              />
            </div>
          )
        },
      }),
    ],
    [filters, skillsData, t, institution_partner_id]
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
              <InstitutionPartnerPriceManagementButton
                languageDirectionKey="new"
                filters={filters}
                institution_partner_id={institution_partner_id}
              />
            </div>
          }
          defaultPaginationData={defaultPaginationData}
        />
      </Root>
      <div hidden={!showDates}>
        <p className={classes.dateText}>
          {t('vendors.price_list_created', { priceListCreated })}
        </p>
        <p className={classes.dateText}>
          {t('vendors.price_list_updated_at', { priceListUpdated })}
        </p>
      </div>
    </>
  )
}

export default InstitutionPartnerPriceListForm
