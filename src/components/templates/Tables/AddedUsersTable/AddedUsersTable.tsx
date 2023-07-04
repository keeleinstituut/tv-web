import { FC, useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, join } from 'lodash'
import {
  createColumnHelper,
  PaginationState,
  ColumnDef,
} from '@tanstack/react-table'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { UserType, StatusKey } from 'types/users'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import classes from './styles.module.scss'

type User = {
  id: string
  name: string
  department: string | undefined
  roles: (string | undefined)[]
  status: StatusKey
}

const columnHelper = createColumnHelper<User>()

type AddedUsersProps = {
  data?: UserType[]
  hidden?: boolean
}

const AddedUsersTable: FC<AddedUsersProps> = ({ data, hidden }) => {
  const { t } = useTranslation()
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  console.log(data)
  const tableData = data
  console.log(tableData)

  const handleColumnFiltersChange = useCallback(
    (filters: string | string[], columnId: string) => {
      //TODO add to endpoint
      //console.log('New column filters:', filters, columnId)
    },
    []
  )
  const onSortingChange = useCallback(
    (filters: string | string[], columnId: string) => {
      //TODO add to endpoint
      //console.log('column sorting:', filters, columnId)
    },
    []
  )

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
            href={`/settings/users/${getValue()}`}
          >
            {'ID xxxxxx'}
          </Button>
        </div>
      ),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
      meta: {
        //Example for adding sorting
        sortingOption: [
          { label: 'Tühjenda filtrid', value: 'clean' },
          { label: 'A - Z', value: 'asc' },
          { label: 'Z - A', value: 'desc' },
        ],
      },
    }),
    columnHelper.accessor('department', {
      header: () => t('label.department'),
      footer: (info) => info.column.id,
      meta: {
        filterOption: [
          { label: 'Option 1', value: 'Option 1' },
          { label: 'Option 2', value: 'Option 2' },
          { label: 'Option 3', value: 'Option 3' },
          { label: 'Option 4', value: 'Option 4' },
          { label: 'Option 5', value: 'Option 5' },
          { label: 'Option 6', value: 'Option 6' },
          { label: 'Option ieruhiruthr7', value: 'Option 7' },
          { label: 'Option 8985759867', value: 'Option 8' },
        ],
      },
    }),
    columnHelper.accessor('roles', {
      header: () => t('label.role'),
      cell: (info) => {
        return join(info.renderValue(), ', ')
      },
      footer: (info) => info.column.id,
      meta: {
        filterOption: [
          { label: 'Option 1', value: 'Option 1' },
          { label: 'Option 2', value: 'Option 2' },
          { label: 'Option 3', value: 'Option 3' },
          { label: 'Option 4', value: 'Option 4' },
          { label: 'Option 5', value: 'Option 5' },
          { label: 'Option 6', value: 'Option 6' },
          { label: 'Option ieruhiruthr7', value: 'Option 7' },
          { label: 'Option 8985759867', value: 'Option 8' },
        ],
      },
    }),
    columnHelper.accessor('status', {
      header: () => t('label.status'),
      footer: (info) => info.column.id,
      meta: {
        filterOption: [
          { label: 'Option 1', value: 'Option 1' },
          { label: 'Option 2', value: 'Option 2' },
          { label: 'Option 3', value: 'Option 3' },
          { label: 'Option 4', value: 'Option 4' },
          { label: 'Option 5', value: 'Option 5' },
          { label: 'Option 6', value: 'Option 6' },
          { label: 'Option ieruhiruthr7', value: 'Option 7' },
          { label: 'Option 8985759867', value: 'Option 8' },
        ],
      },
    }),
  ] as ColumnDef<User>[]

  if (hidden) return null

  return (
    <DataTable
      data={usersData}
      columns={columns}
      title={t('users.added_users')}
      pagination={pagination}
      setPagination={setPagination}
      tableSize={TableSizeTypes.M}
      onColumnFiltersChange={handleColumnFiltersChange}
      onSortingChange={onSortingChange}
    />
  )
}

export default AddedUsersTable
