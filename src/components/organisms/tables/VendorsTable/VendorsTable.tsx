import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { useDepartmentsFetch } from 'hooks/requests/useDepartments'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, join, includes } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'

import {
  FilterFunctionType,
  SortingFunctionType,
  DataMetaTypes,
  PaginationFunctionType,
} from 'types/collective'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import classes from './classes.module.scss'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'
import { VendorType } from 'types/vendors'

type VendorsTableProps = {
  data?: VendorType[]
  paginationData?: DataMetaTypes
  hidden?: boolean
  handleFilterChange?: (value?: FilterFunctionType) => void
  handleSortingChange?: (value?: SortingFunctionType) => void
  handlePaginationChange?: (value?: PaginationFunctionType) => void
}

const AddedUsersTable: FC<VendorsTableProps> = ({ data, hidden }) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const { rolesFilters = [] } = useRolesFetch()
  const { departmentFilters = [] } = useDepartmentsFetch()

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
          const arrayOfRoles = map(roles, 'name')

          const languageDirections = map(
            prices,
            ({
              source_language_classifier_value,
              destination_language_classifier_value,
            }) =>
              `${source_language_classifier_value.value} > ${destination_language_classifier_value.value}`
          )

          return {
            id,
            languageDirections,
            tags,
            name: `${user?.forename} ${user?.surname}`,
            companyName: company_name,
            roles: arrayOfRoles,
          }
        }
      ) || {}
    )
  }, [data])

  const columns = [
    columnHelper.accessor('languageDirections', {
      header: () => t('label.language_directions'),
      footer: (info) => info.column.id,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
    columnHelper.accessor('role', {
      header: () => t('label.role'),
      cell: (info) => {
        return join(info.renderValue(), ', ')
      },
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
      header: () => t('label.tags'),
      footer: (info) => info.column.id,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
  ]

  if (hidden) return null

  return (
    <DataTable
      data={vendorsData}
      columns={columns}
      tableSize={TableSizeTypes.M}
    />
    // paginationData={paginationData}
    // onPaginationChange={handlePaginationChange}
    // onFiltersChange={handleFilterChange}
    // onSortingChange={handleSortingChange}
  )
}

export default AddedUsersTable
