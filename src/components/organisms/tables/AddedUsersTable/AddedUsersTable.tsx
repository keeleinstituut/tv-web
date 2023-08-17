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
import { UserType, UserStatus } from 'types/users'
import {
  FilterFunctionType,
  SortingFunctionType,
  ResponseMetaTypes,
  PaginationFunctionType,
} from 'types/collective'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import classes from './classes.module.scss'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'

type User = {
  id: string
  name: string
  department: string[] | undefined
  roles: (string | undefined)[]
  status: UserStatus
}

const columnHelper = createColumnHelper<User>()

type AddedUsersProps = {
  data?: UserType[]
  paginationData?: ResponseMetaTypes
  hidden?: boolean
  handleFilterChange?: (value?: FilterFunctionType) => void
  handleSortingChange?: (value?: SortingFunctionType) => void
  handlePaginationChange?: (value?: PaginationFunctionType) => void
}

const AddedUsersTable: FC<AddedUsersProps> = ({
  data,
  paginationData,
  hidden,
  handleFilterChange,
  handleSortingChange,
  handlePaginationChange,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const { rolesFilters = [] } = useRolesFetch()
  const { departmentFilters = [] } = useDepartmentsFetch()

  const usersData = useMemo(() => {
    return (
      map(data, ({ id, roles, user, department, status }) => {
        const arrayOfRoles = map(roles, 'name')
        return {
          id,
          name: `${user?.forename} ${user?.surname}`,
          department,
          roles: arrayOfRoles,
          status,
        }
      }) || {}
    )
  }, [data])

  const columns = [
    columnHelper.accessor('id', {
      header: () => t('label.user_account_id'),
      cell: ({ getValue }) => (
        <div className={classes.addedUserLink}>
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.M}
            icon={ArrowRight}
            ariaLabel={t('label.button_arrow')}
            iconPositioning={IconPositioningTypes.Left}
            disabled={!includes(userPrivileges, Privileges.ViewUser)}
            href={`/settings/users/${getValue()}`}
          >
            {`ID ${getValue()}`}
          </Button>
        </div>
      ),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
    columnHelper.accessor('department', {
      header: () => t('label.department'),
      footer: (info) => info.column.id,
      meta: {
        filterOption: { departments: departmentFilters },
      },
    }),
    columnHelper.accessor('roles', {
      header: () => t('label.role'),
      cell: (info) => {
        return join(info.renderValue(), ', ')
      },
      footer: (info) => info.column.id,
      meta: {
        filterOption: { roles: rolesFilters },
      },
    }),
    columnHelper.accessor('status', {
      header: () => t('label.status'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return t(`user.status.${getValue()}`)
      },
      meta: {
        filterOption: {
          statuses: [
            // not using enum values for translations, so there would be less changes needed
            // If the enum values change
            { label: t('user.status.ACTIVE'), value: UserStatus.Active },
            {
              label: t('user.status.DEACTIVATED'),
              value: UserStatus.Deactivated,
            },
            { label: t('user.status.ARCHIVED'), value: UserStatus.Archived },
          ],
        },
        filterValue: [UserStatus.Active, UserStatus.Deactivated],
      },
    }),
  ] as ColumnDef<User>[]

  if (hidden) return null

  return (
    <DataTable
      data={usersData}
      columns={columns}
      title={t('users.added_users')}
      tableSize={TableSizeTypes.M}
      paginationData={paginationData}
      onPaginationChange={handlePaginationChange}
      onFiltersChange={handleFilterChange}
      onSortingChange={handleSortingChange}
    />
  )
}

export default AddedUsersTable
