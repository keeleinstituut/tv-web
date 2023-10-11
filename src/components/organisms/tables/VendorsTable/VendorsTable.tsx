import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { useFetchTags } from 'hooks/requests/useTags'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import { map, join, compact, split } from 'lodash'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import Tag from 'components/atoms/Tag/Tag'
import {
  FilterFunctionType,
  SortingFunctionType,
  ResponseMetaTypes,
  PaginationFunctionType,
} from 'types/collective'
import classes from './classes.module.scss'
import { Vendor } from 'types/vendors'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'

type VendorsTableProps = {
  data?: Vendor[]
  paginationData?: ResponseMetaTypes
  hidden?: boolean
  handleFilterChange?: (value?: FilterFunctionType) => void
  handleSortingChange?: (value?: SortingFunctionType) => void
  handlePaginationChange?: (value?: PaginationFunctionType) => void
}

const VendorsTable: FC<VendorsTableProps> = ({
  data,
  hidden,
  paginationData,
  handleFilterChange,
  handleSortingChange,
  handlePaginationChange,
}) => {
  const { t } = useTranslation()

  const { rolesFilters = [] } = useRolesFetch()
  const { tagsFilters = [] } = useFetchTags()
  const { languageDirectionFilters, loadMore, handleSearch } =
    useLanguageDirections({})

  type OrderTableRow = {
    id?: string
    languageDirections: string[]
    tags: string[]
    name: string
    companyName: string
    roles: string[]
  }

  const columnHelper = createColumnHelper<OrderTableRow>()

  const vendorsData = useMemo(() => {
    return (
      map(
        data,
        ({
          id,
          tags,
          prices,
          institution_user: { roles, user },
          company_name,
        }) => {
          const roleNames = compact(map(roles, 'name'))

          const languageDirections = map(
            prices,
            ({
              source_language_classifier_value: srcLang,
              destination_language_classifier_value: destLang,
            }) => `${srcLang.value} > ${destLang.value}`
          )

          const tagNames = map(tags, 'name')

          return {
            id,
            languageDirections,
            tags: tagNames,
            name: `${user?.forename} ${user?.surname}`,
            companyName: company_name,
            roles: roleNames,
          }
        }
      ) || {}
    )
  }, [data])

  const handleModifiedFilterChange = useCallback(
    (filters?: FilterFunctionType) => {
      // language_direction will be an array of strings
      const { language_direction, ...rest } = filters || {}
      const typedLanguageDirection = language_direction as string[]

      const langPair = map(
        typedLanguageDirection,
        (languageDirectionString) => {
          const [src, dst] = split(languageDirectionString, '>')
          return { src, dst }
        }
      )

      const newFilters = {
        lang_pair: langPair,
        ...rest,
      }

      if (handleFilterChange) {
        handleFilterChange(newFilters)
      }
    },
    [handleFilterChange]
  )

  const columns = [
    columnHelper.accessor('languageDirections', {
      header: () => t('label.language_directions'),
      cell: ({ getValue }) => {
        return (
          <div className={classes.tagsRow}>
            {map(getValue(), (value, index) => (
              <Tag label={value} value key={index} />
            ))}
          </div>
        )
      },
      footer: (info) => info.column.id,
      meta: {
        filterOption: { language_direction: languageDirectionFilters },
        onEndReached: loadMore,
        onSearch: handleSearch,
        showSearch: true,
      },
    }),
    columnHelper.accessor('roles', {
      header: () => t('label.role'),
      cell: ({ renderValue }) => join(renderValue(), ', '),
      footer: (info) => info.column.id,
      meta: {
        filterOption: { role_id: rolesFilters },
        showSearch: true,
      },
    }),
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('companyName', {
      header: () => t('label.company_name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('tags', {
      header: () => t('label.vendor_tags'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return (
          <div className={classes.tagsRow}>
            {map(getValue(), (value) => (
              <Tag label={value} value key={value} />
            ))}
          </div>
        )
      },
      meta: {
        filterOption: { tag_id: tagsFilters },
      },
    }),
    columnHelper.accessor('id', {
      header: () => <></>,
      cell: ({ getValue }) => (
        <Button
          appearance={AppearanceTypes.Text}
          size={SizeTypes.M}
          icon={ArrowRight}
          ariaLabel={t('label.to_order_view')}
          iconPositioning={IconPositioningTypes.Left}
          href={`/vendors/${getValue()}`}
        >
          {t('label.view')}
        </Button>
      ),
    }),
  ] as ColumnDef<OrderTableRow>[]

  if (hidden) return null

  return (
    <DataTable
      data={vendorsData}
      columns={columns}
      tableSize={TableSizeTypes.M}
      paginationData={paginationData}
      onPaginationChange={handlePaginationChange}
      onFiltersChange={handleModifiedFilterChange}
      onSortingChange={handleSortingChange}
    />
  )
}

export default VendorsTable
