import { FC, useCallback, useEffect, useMemo } from 'react'
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
import { useInstitutionsFetch } from 'hooks/requests/useInstitutions'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
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

  const { institutions } = useInstitutionsFetch()
  const institutionOptions = useMemo(
    () => map(institutions, ({ id, name }) => ({ label: name, value: id })),
    [institutions]
  )

  const { languageDirectionFilters, loadMore, handleSearch } = useLanguageDirections({})

  const { classifierValuesFilters: typeFilters } = useClassifierValuesFetch({
    type: ClassifierValueType.ProjectType,
  })

  const handleModifiedFilterChange = useCallback(
    (value?: FilterFunctionType) => {
      let current = value
      if (value && 'language_directions' in value) {
        const { language_directions, ...rest } = current || {}
        current = {
          language_directions: map(language_directions as string[], (s) => s.replace('_', ':')),
          ...rest,
        }
      }
      if (value && 'institution_id' in value) {
        const { institution_id, ...rest } = current || {}
        const ids = institution_id as string[]
        current = {
          institution_id: ids?.[0] || '',
          ...rest,
        }
      }
      onFiltersChange?.(current)
    },
    [onFiltersChange]
  )

  const { control, watch } = useForm<{ q: string; status: OutsourceOfferStatus[] }>({
    defaultValues: { q: '', status: filters.status ?? [] },
  })

  useEffect(() => {
    const subscription = watch((value) => {
      onFiltersChange?.({ q: value.q || '', status: value.status as string[], page: 1 })
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
          deadline_at: o?.expires_at ?? undefined,
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
          meta: {
            FilteringComponent: (
              <TableSelectFilter
                filterKey="institution_id"
                options={institutionOptions}
                value={filters?.institution_id ? [filters.institution_id] : []}
                isCustomSingleDropdown
              />
            ),
          },
        }),
        columnHelper.accessor('owner_institution_email', {
          header: () => t('requests.table.owner_email'),
          cell: ({ getValue }) => getValue() ?? '-',
        }),
        columnHelper.accessor('job_short_name', {
          header: () => t('requests.table.job_name'),
          cell: ({ getValue }) => getValue() ?? '-',
          meta: {
            FilteringComponent: (
              <TableSelectFilter
                filterKey="type_classifier_value_ids"
                options={typeFilters}
                value={filters?.type_classifier_value_ids ?? []}
                isCustomSingleDropdown
              />
            ),
          },
        }),
        columnHelper.accessor('languages', {
          header: () => t('requests.table.languages'),
          cell: ({ getValue }) =>
            getValue().length > 0 ? (
              <LanguageDirectionTags values={getValue()} />
            ) : (
              '-'
            ),
          meta: {
            FilteringComponent: (
              <TableSelectFilter
                filterKey="language_directions"
                options={languageDirectionFilters}
                onEndReached={loadMore}
                onSearch={handleSearch}
                showSearch
                value={
                  filters?.language_directions
                    ? filters.language_directions.map((v) => v.replace(':', '_'))
                    : []
                }
              />
            ),
          },
        }),
        columnHelper.accessor('status', {
          header: () => t('requests.table.status'),
          cell: ({ getValue }) => t(`requests.offer_status.${getValue()}`),
        }),
        columnHelper.accessor('deadline_at', {
          header: () => t('requests.table.deadline'),
          cell: ({ getValue }) => formatDate(getValue()),
          meta: {
            sortingOption: ['asc', 'desc'],
            sortingParameterName: 'expires_at',
            currentSorting:
              filters.sort_by === 'expires_at' ? filters.sort_order : undefined,
          },
        }),
      ] as ColumnDef<OfferRow>[],
    [t, institutionOptions, languageDirectionFilters, loadMore, handleSearch, filters, statusFilterOptions, typeFilters]
  )

  return (
    <Root>
      <DataTable
        data={rows}
        columns={columns}
        headComponent={
          <div className={classes.headContainer}>
            <FormInput
              name="status"
              control={control}
              options={statusFilterOptions}
              inputType={InputTypes.TagsSelect}
            />
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
        onFiltersChange={handleModifiedFilterChange}
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
