import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { useFetchTags } from 'hooks/requests/useTags'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import { map, join, compact } from 'lodash'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import Tag from 'components/atoms/Tag/Tag'
import {
  FilterFunctionType,
  SortingFunctionType,
  ResponseMetaTypes,
  PaginationFunctionType,
} from 'types/collective'
import classes from './classes.module.scss'
import { ClassifierValueType } from 'types/classifierValues'
import { Vendor } from 'types/vendors'

type VendorsTableProps = {
  data?: Vendor[]
  paginationData?: ResponseMetaTypes
  hidden?: boolean
  handleFilterChange?: (value?: FilterFunctionType) => void
  handleSortingChange?: (value?: SortingFunctionType) => void
  handlePaginationChange?: (value?: PaginationFunctionType) => void
}

const AddedUsersTable: FC<VendorsTableProps> = ({
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
  const { classifierValuesFilters = [] } = useClassifierValuesFetch({
    type: ClassifierValueType.Language,
  }) // TODO: save them to local state when API available?

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

  const columns = [
    columnHelper.accessor('languageDirections', {
      header: () => t('label.language_directions'),
      cell: ({ getValue }) => {
        return (
          <div className={classes.languageRow}>
            {map(getValue(), (value) => (
              <Tag label={value} value key={value} />
            ))}
          </div>
        )
      },
      footer: (info) => info.column.id,
      meta: {
        sortingOption: ['asc', 'desc'], // TODO: when API available
      },
    }),
    columnHelper.accessor('roles', {
      header: () => t('label.role'),
      cell: ({ renderValue }) => join(renderValue(), ', '),
      footer: (info) => info.column.id,
      meta: {
        filterOption: { role_id: rolesFilters },
      },
    }),
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
    columnHelper.accessor('companyName', {
      header: () => t('label.company_name'),
      footer: (info) => info.column.id,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
    columnHelper.accessor('tags', {
      header: () => t('label.order_tags'),
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
  ] as ColumnDef<OrderTableRow>[] // Seems like an package issue https://github.com/TanStack/table/issues/4382

  if (hidden) return null

  return (
    <DataTable
      data={vendorsData}
      columns={columns}
      tableSize={TableSizeTypes.M}
      paginationData={paginationData}
      onPaginationChange={handlePaginationChange}
      onFiltersChange={handleFilterChange}
      onSortingChange={handleSortingChange}
    />
  )
}

export default AddedUsersTable
