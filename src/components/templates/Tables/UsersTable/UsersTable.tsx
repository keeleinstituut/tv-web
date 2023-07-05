import { FC, useState, useMemo } from 'react'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, join } from 'lodash'
import {
  createColumnHelper,
  PaginationState,
  ColumnDef,
} from '@tanstack/react-table'

import users from 'components/templates/Tables/users.json'

export type Person = {
  id: string
  name: string
  email: string
  phone: string
  department: string | null
  roles: string[]
  subRows?: Person[]
}

const columnHelper = createColumnHelper<Person>()

const UsersTable: FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const tableData = users?.data

  const usersData = useMemo(() => {
    return (
      map(tableData, (data) => {
        const arrayOfRoles = map(data.roles, ({ name }) => name)
        return {
          id: data.user.personal_identification_code,
          name: `${data.user?.forename} ${data.user?.surname}`,
          email: data.email,
          phone: data.phone,
          department: data.department,
          roles: arrayOfRoles,
          subRows: [],
        }
      }) || {}
    )
  }, [tableData])

  const columns = [
    columnHelper.accessor('id', {
      header: () => 'Isikukood',
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('name', {
      header: () => 'Nimi',
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('email', {
      header: () => 'Meiliaadress',
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('phone', {
      header: () => 'Telefoninumber',
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('department', {
      header: () => 'Üksus',
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('roles', {
      header: () => 'Roll',
      cell: (info) => {
        return join(info.renderValue(), ', ')
      },
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<Person>[]

  return (
    <DataTable
      data={usersData}
      columns={columns}
      pagination={pagination}
      setPagination={setPagination}
      tableSize={TableSizeTypes.L}
    />
  )
}

export default UsersTable
