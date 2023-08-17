import { FC, useRef } from 'react'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, compact, size, keys, includes } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import { UserCsvType } from 'types/users'
import { useTranslation } from 'react-i18next'
import { Control } from 'react-hook-form'
import CellInput from 'components/organisms/CellInput/CellInput'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'

import classes from './classes.module.scss'
import { useDepartmentsFetch } from 'hooks/requests/useDepartments'
import { RolePayload } from 'types/roles'

export interface ErrorsInRow {
  [key: string]: string[]
}

interface AddUsersTableProps {
  tableData: UserCsvType[]
  rowsWithErrors: ErrorsInRow
  rowsWithExistingUsers?: number[]
  control: Control
  existingRoles: RolePayload[]
}

export type Person = UserCsvType & {
  subRows?: Person[]
}

const columnHelper = createColumnHelper<Person>()

const AddUsersTable: FC<AddUsersTableProps> = ({
  tableData,
  control,
  rowsWithErrors,
  rowsWithExistingUsers,
  existingRoles,
}) => {
  const containerRef = useRef(null)
  const { t } = useTranslation()
  const { existingDepartments = [] } = useDepartmentsFetch()

  const roleOptions = compact(
    map(existingRoles, ({ name }) => {
      if (name) {
        return {
          label: name,
          value: name,
        }
      }
    })
  )

  const departmentOptions = compact(
    map(existingDepartments, ({ name }) => {
      if (name) {
        return {
          label: name,
          value: name,
        }
      }
    })
  )

  const numberOfRows = size(tableData)
  const numberOfColumns = size(keys(tableData[0]))

  const columns = [
    columnHelper.accessor('personal_identification_code', {
      header: () => t('table.personal_identification_code'),
      cell: ({ row }) => {
        // We need the z-index of the error in every cell to be larger
        // than the error for the cell underneath it and to the right of it
        // (numberOfRows - row.index) -- Same for every cell in a row, but always +1 compared to the following row
        // (numberOfColumns - 1)  -- Same for every cell in a column, but always +1 compared to the next column
        // If we add these together we get a number, which is always +1 higher than the cell to the right or to the bottom
        const errorZIndex = numberOfRows - row.index + (numberOfColumns - 1)
        return (
          <div className={classes.row}>
            <CellInput<UserCsvType>
              typedKey={'personal_identification_code'}
              ariaLabel={t('label.personal_identification_code')}
              rowIndex={row?.index}
              control={control}
              rowErrors={rowsWithErrors[`row-${row?.index}`]}
              errorZIndex={errorZIndex}
              type="number"
            />
            <SmallTooltip
              hidden={!includes(rowsWithExistingUsers, row.index)}
              tooltipContent={t('tooltip.user_already_exists')}
              className={classes.tooltipPosition}
              containerRef={containerRef}
            />
          </div>
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('name', {
      header: t('table.name'),
      cell: ({ row }) => {
        const errorZIndex = numberOfRows - row.index + (numberOfColumns - 2)
        return (
          <CellInput<UserCsvType>
            typedKey={'name'}
            ariaLabel={t('label.name')}
            rowIndex={row?.index}
            control={control}
            rowErrors={rowsWithErrors[`row-${row?.index}`]}
            errorZIndex={errorZIndex}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('email', {
      header: () => t('table.email'),
      cell: ({ row }) => {
        const errorZIndex = numberOfRows - row.index + (numberOfColumns - 3)
        return (
          <CellInput<UserCsvType>
            typedKey={'email'}
            ariaLabel={t('label.email')}
            rowIndex={row?.index}
            control={control}
            rowErrors={rowsWithErrors[`row-${row?.index}`]}
            errorZIndex={errorZIndex}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('phone', {
      header: () => t('table.phone'),
      cell: ({ row }) => {
        const errorZIndex = numberOfRows - row.index + (numberOfColumns - 4)
        return (
          <CellInput<UserCsvType>
            typedKey={'phone'}
            ariaLabel={t('label.phone')}
            rowIndex={row?.index}
            control={control}
            rowErrors={rowsWithErrors[`row-${row?.index}`]}
            errorZIndex={errorZIndex}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('department', {
      header: () => t('table.department'),
      cell: ({ row }) => {
        const errorZIndex = numberOfRows - row.index + (numberOfColumns - 5)
        return (
          <CellInput<UserCsvType>
            typedKey={'department'}
            ariaLabel={t('label.department')}
            rowIndex={row?.index}
            control={control}
            rowErrors={rowsWithErrors[`row-${row?.index}`]}
            errorZIndex={errorZIndex}
            options={departmentOptions}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('role', {
      header: () => t('table.role'),
      cell: ({ row }) => {
        const errorZIndex = numberOfRows - row.index + (numberOfColumns - 6)
        return (
          <CellInput<UserCsvType>
            typedKey={'role'}
            ariaLabel={t('label.roles')}
            rowIndex={row?.index}
            control={control}
            rowErrors={rowsWithErrors[`row-${row?.index}`]}
            errorZIndex={errorZIndex}
            options={roleOptions}
          />
        )
      },
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<Person>[]

  return (
    <DataTable
      data={tableData}
      columns={columns}
      //paginationData={pagination}
      //onPaginationChange={onPaginationChange}
      tableSize={TableSizeTypes.M}
      ref={containerRef}
      pageSizeOptions={[
        { label: '10', value: '10' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
      ]}
    />
  )
}

export default AddUsersTable
