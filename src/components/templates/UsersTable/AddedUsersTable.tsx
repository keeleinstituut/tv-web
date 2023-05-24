import { FC, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/templates/DataTable/DataTable'
import { map, join } from 'lodash'
import { createColumnHelper, PaginationState } from '@tanstack/react-table'
import TableFilter from 'components/organisms/TableFilter/TableFilter'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'

import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import { Link } from 'react-router-dom'
import users from 'components/templates/UsersTable/users.json'

export type Person = {
  id: string
  name: string
  department: string
  roles: []
  status: string
}

const columnHelper = createColumnHelper<Person>()

const AddedUsersTable: FC = () => {
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
          id: data.id,
          name: `${data.user?.forename} ${data.user?.surname}`,
          department: data.department,
          roles: arrayOfRoles,
          status: data.status,
        }
      }) || {}
    )
  }, [tableData])

  const columns = [
    columnHelper.accessor('id', {
      header: () => 'Kasutajakonto ID',
      cell: ({ row, getValue }) => (
        //Example for link row cell
        <div
          style={{
            display: 'grid',
            gridAutoFlow: 'column',
            width: 'max-content',
            gap: '10px',
            alignItems: 'left',
          }}
        >
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.M}
            icon={ArrowRight}
            ariaLabel={t('label.button_arrow')}
            iconPositioning={IconPositioningTypes.Left}
          >
            <Link to={`/user=${getValue()}`}>{'ID xxxxxx'}</Link>
          </Button>
        </div>
      ),
      footer: (info) => info.column.id,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('name', {
      header: () => 'Nimi',
      footer: (info) => info.column.id,
      enableColumnFilter: false,
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
    columnHelper.accessor('status', {
      header: ({ table, column }) => (
        //One example how to add filter component
        <>
          Staatus
          <TableFilter table={table} column={column} />
        </>
      ),
      footer: (info) => info.column.id,
      enableColumnFilter: false,
    }),
  ]

  return (
    <DataTable
      data={usersData}
      columns={columns}
      title="Lisatud kasutajad"
      filterable
      pagination={pagination}
      setPagination={setPagination}
      tableSize={TableSizeTypes.M}
    />
  )
}

export default AddedUsersTable
