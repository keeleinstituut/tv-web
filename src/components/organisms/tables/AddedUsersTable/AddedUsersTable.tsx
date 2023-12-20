import { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { useDepartmentsFetch } from 'hooks/requests/useDepartments'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, join, includes, isEmpty, debounce } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { UserStatus } from 'types/users'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import classes from './classes.module.scss'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'
import { useSearchParams } from 'react-router-dom'
import TextInput from 'components/molecules/TextInput/TextInput'
import { Root } from '@radix-ui/react-form'
import Loader from 'components/atoms/Loader/Loader'
import { useFetchUsers } from 'hooks/requests/useUsers'
import classNames from 'classnames'

type TableRow = {
  id: string
  name: string
  department: string
  roles: (string | undefined)[]
  status: UserStatus
}

const columnHelper = createColumnHelper<TableRow>()

type AddedUsersProps = {
  hidden?: boolean
}

const AddedUsersTable: FC<AddedUsersProps> = ({ hidden }) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const [searchParams] = useSearchParams()
  const initialFilters = {
    ...Object.fromEntries(searchParams.entries()),
    statuses: (searchParams.getAll('statuses') as UserStatus[]) || [
      UserStatus.Active,
      UserStatus.Deactivated,
    ],
    roles: searchParams.getAll('roles'),
    departments: searchParams.getAll('departments'),
  }

  const {
    users,
    paginationData,
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
    isLoading: isUsersLoading,
  } = useFetchUsers({ initialFilters: initialFilters, saveQueryParams: true })

  const { rolesFilters = [] } = useRolesFetch({})
  const { departmentFilters = [] } = useDepartmentsFetch()

  const defaultPaginationData = {
    per_page: Number(filters.per_page),
    page: Number(filters.page) - 1,
  }

  const [searchValue, setSearchValue] = useState<string>(
    filters?.fullname || ''
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChangeHandler = useCallback(
    debounce(handleFilterChange, 300, {
      leading: false,
      trailing: true,
    }),
    []
  )

  const handleSearchUsers = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debouncedChangeHandler({ fullname: event.target.value })
    },
    [debouncedChangeHandler]
  )

  const usersData = useMemo(() => {
    return (
      map(users, ({ id, roles, user, department, status }) => {
        const arrayOfRoles = map(roles, 'name')
        return {
          id,
          name: `${user?.forename} ${user?.surname}`,
          department: department?.name || '',
          roles: arrayOfRoles,
          status,
        }
      }) || {}
    )
  }, [users])

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
      size: 500,
    }),
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
      size: 200,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting: filters?.sort_by === 'name' ? filters.sort_order : '',
      },
    }),
    columnHelper.accessor('department', {
      header: () => t('label.department'),
      footer: (info) => info.column.id,
      size: 200,
      meta: {
        filterOption: { departments: departmentFilters },
        filterValue: filters?.departments || [],
      },
    }),
    columnHelper.accessor('roles', {
      header: () => t('label.role'),
      cell: (info) => {
        return join(info.renderValue(), ', ')
      },
      footer: (info) => info.column.id,
      size: 200,
      meta: {
        filterOption: { roles: rolesFilters },
        filterValue: filters?.roles || [],
      },
    }),
    columnHelper.accessor('status', {
      header: () => t('label.status'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return t(`user.status.${getValue()}`)
      },
      size: 100,
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
        filterValue: filters?.statuses || [],
      },
    }),
  ] as ColumnDef<TableRow>[]

  if (hidden) return null

  return (
    <Root onSubmit={(e) => e.preventDefault()}>
      <Loader loading={isUsersLoading && isEmpty(users)} />
      <DataTable
        data={usersData}
        columns={columns}
        title={t('users.added_users')}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        onFiltersChange={handleFilterChange}
        onSortingChange={handleSortingChange}
        defaultPaginationData={defaultPaginationData}
        pageSizeOptions={[
          { label: '10', value: '10' },
          { label: '50', value: '50' },
          { label: '100', value: '100' },
        ]}
        headComponent={
          <div className={classNames(classes.topSection)}>
            <TextInput
              name={'search'}
              ariaLabel={t('placeholder.search_by_name')}
              placeholder={t('placeholder.search_by_name')}
              value={searchValue}
              onChange={handleSearchUsers}
              className={classes.searchInput}
              inputContainerClassName={classes.generalUsersListInput}
              isSearch
            />
          </div>
        }
      />
    </Root>
  )
}

export default AddedUsersTable
