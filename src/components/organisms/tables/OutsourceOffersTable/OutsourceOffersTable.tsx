import { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { map } from 'lodash'
import dayjs from 'dayjs'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { Root } from '@radix-ui/react-form'

import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { TableSelectFilter } from 'components/organisms/TableHeaderGroup/TableHeaderGroup'
import { FormInput, InputTypes } from 'components/organisms/DynamicForm/DynamicForm'
import LanguageDirectionTags from 'components/atoms/LanguageDirectionTags/LanguageDirectionTags'
import ArrowRight from 'assets/icons/arrow_right.svg?react'
import classes from './classes.module.scss'
import {
  OutsourceOffer,
  OutsourceOfferFilters,
  OutsourceOfferStatus,
} from 'types/outsourceRequests'
import {
  FilterFunctionType,
  PaginationFunctionType,
  ResponseMetaTypes,
  SortingFunctionType,
} from 'types/collective'

type OfferRow = {
  id: string
  ext_id: string | undefined
  owner_institution_name: string | undefined
  owner_institution_email: string | undefined
  job_short_name: string | undefined
  languages: string[]
  status: OutsourceOfferStatus
  deadline_at: string | undefined
}

const columnHelper = createColumnHelper<OfferRow>()

export interface OutsourceOffersTableProps {
  offers: OutsourceOffer[]
  isLoading: boolean
  paginationData?: ResponseMetaTypes
  filters: OutsourceOfferFilters
  onPaginationChange?: (value?: PaginationFunctionType) => void
  onSortingChange?: (value?: SortingFunctionType) => void
  onFiltersChange?: (value?: FilterFunctionType) => void
}

const formatDate = (iso?: string | null) =>
  iso ? dayjs(iso).format('DD.MM.YYYY HH:mm') : '-'

const OutsourceOffersTable: FC<OutsourceOffersTableProps> = ({
  offers,
  filters,
  paginationData,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
}) => {
  const { t } = useTranslation()

  const { control, watch } = useForm<{ q: string }>({
    defaultValues: { q: '' },
  })

  useEffect(() => {
    const subscription = watch((value) => {
      onFiltersChange?.({ q: value.q || '', page: 1 })
    })
    return () => subscription.unsubscribe()
  }, [watch, onFiltersChange])

  const rows = useMemo<OfferRow[]>(
    () =>
      map(offers, (o) => {
        const req = o.outsource_request
        const subProject = req?.assignment?.subProject
        const srcVal = subProject?.source_language_classifier_value?.value
        const dstVal = subProject?.destination_language_classifier_value?.value
        const languages =
          srcVal && dstVal
            ? [`${srcVal} > ${dstVal}`]
            : srcVal
            ? [srcVal]
            : dstVal
            ? [dstVal]
            : []
        return {
          id: o.id,
          ext_id: req?.assignment?.ext_id,
          owner_institution_name: req?.owner_institution?.name ?? undefined,
          owner_institution_email: req?.owner_institution?.email ?? undefined,
          job_short_name: req?.assignment?.job_definition?.job_short_name ?? undefined,
          languages,
          status: o.status,
          deadline_at: req?.deadline_at ?? undefined,
        }
      }),
    [offers]
  )

  const statusFilterOptions = useMemo(
    () =>
      map(OutsourceOfferStatus, (value) => ({
        label: t(`requests.offer_status.${value}`),
        value,
      })),
    [t]
  )

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('ext_id', {
          header: () => t('requests.table.request_id'),
          cell: ({ row }) => (
            <Button
              appearance={AppearanceTypes.Text}
              size={SizeTypes.M}
              icon={ArrowRight}
              iconPositioning={IconPositioningTypes.Left}
              href={`/projects/outsource-offers/${row.original.id}`}
              ariaLabel={t('requests.table.request_id')}
            >
              {row.original.ext_id}
            </Button>
          ),
        }),
        columnHelper.accessor('owner_institution_name', {
          header: () => t('requests.table.owner_institution'),
          cell: ({ getValue }) => getValue() ?? '-',
        }),
        columnHelper.accessor('owner_institution_email', {
          header: () => t('requests.table.owner_email'),
          cell: ({ getValue }) => getValue() ?? '-',
        }),
        columnHelper.accessor('job_short_name', {
          header: () => t('requests.table.job_name'),
          cell: ({ getValue }) => getValue() ?? '-',
        }),
        columnHelper.accessor('languages', {
          header: () => t('requests.table.languages'),
          cell: ({ getValue }) =>
            getValue().length > 0 ? (
              <LanguageDirectionTags values={getValue()} />
            ) : (
              '-'
            ),
        }),
        columnHelper.accessor('status', {
          header: () => t('requests.table.status'),
          cell: ({ getValue }) => t(`requests.offer_status.${getValue()}`),
          meta: {
            FilteringComponent: (
              <TableSelectFilter
                filterKey="status"
                options={statusFilterOptions}
                value={filters.status ?? []}
              />
            ),
          },
        }),
        columnHelper.accessor('deadline_at', {
          header: () => t('requests.table.deadline'),
          cell: ({ getValue }) => formatDate(getValue()),
        }),
      ] as ColumnDef<OfferRow>[],
    [t]
  )

  return (
    <Root>
      <DataTable
        data={rows}
        columns={columns}
        headComponent={
          <div className={classes.headContainer}>
            <FormInput
              name="q"
              control={control}
              inputType={InputTypes.Text}
              isSearch
              ariaLabel={t('placeholder.search_by_id_or_reference_number')}
              className={classes.searchInput}
              inputContainerClassName={classes.searchInnerContainer}
              placeholder={t('placeholder.search_by_id_or_reference_number')}
            />
          </div>
        }
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        onFiltersChange={onFiltersChange}
        pageSizeOptions={[
          { label: '10', value: '10' },
          { label: '25', value: '25' },
          { label: '50', value: '50' },
        ]}
      />
    </Root>
  )
}

export default OutsourceOffersTable
