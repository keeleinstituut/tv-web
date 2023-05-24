import { FC, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/templates/DataTable/DataTable'
import { map, join } from 'lodash'
import { createColumnHelper, PaginationState } from '@tanstack/react-table'

import users from 'components/templates/UsersTable/users.json'

export type Person = {
  id: string
  name: string
  email: string
  phone: string
  department: string
  roles: []
}

const columnHelper = createColumnHelper<Person>()

const UsersTable: FC = () => {
  const { t } = useTranslation()
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
        console.log('rollid', info.renderValue())
        return join(info.renderValue(), ', ')
      },
      footer: (info) => info.column.id,
    }),
  ]

  console.log('data', usersData)

  return (
    <DataTable
      data={usersData}
      columns={columns}
      pagination={pagination}
      setPagination={setPagination}
      tableSize={TableSizeTypes.M}
    />
  )
}

export default UsersTable
