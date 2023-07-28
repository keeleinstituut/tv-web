import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { useDepartmentsFetch } from 'hooks/requests/useDepartments'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, join } from 'lodash'
import { createColumnHelper } from '@tanstack/react-table'
import Tag from 'components/atoms/Tag/Tag'
import {
  FilterFunctionType,
  SortingFunctionType,
  DataMetaTypes,
  PaginationFunctionType,
} from 'types/collective'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import classes from './classes.module.scss'
import { VendorType } from 'types/vendors'

type VendorsTableProps = {
  data?: VendorType[]
  paginationData?: DataMetaTypes
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

  const columnHelper = createColumnHelper<any>()

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
          const roleNames = map(roles, 'name')

          const languageDirections = map(
            prices,
            ({
              source_language_classifier_value,
              destination_language_classifier_value,
            }) =>
              `${source_language_classifier_value.value} > ${destination_language_classifier_value.value}`
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
          <div className={classes.tagsRow}>
            {map(getValue(), (value) => (
              <Tag label={value} value key={value} />
            ))}
          </div>
        )
      },
      footer: (info) => info.column.id,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
    columnHelper.accessor('roles', {
      header: () => t('label.role'),
      cell: ({ renderValue }) => join(renderValue(), ', '),
      footer: (info) => info.column.id,
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
    }),
  ] // TODO: type

  if (hidden) return null

  console.log({
    paginationData,
    handleFilterChange,
    handlePaginationChange,
    handleSortingChange,
  })

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
