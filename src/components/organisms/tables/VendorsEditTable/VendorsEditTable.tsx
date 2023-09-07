import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { FormInput } from 'components/organisms/DynamicForm/DynamicForm'
import { InputTypes } from 'components/organisms/DynamicInputComponent/DynamicInputComponent'
import { Control } from 'react-hook-form'
import { PaginationFunctionType, ResponseMetaTypes } from 'types/collective'

export interface VendorsEditProps {
  data?: any
  control: Control
  handlePaginationChange?: (value?: PaginationFunctionType) => void
  paginationData?: ResponseMetaTypes
}

export type VendorUser = {
  id?: string
  name?: string
  vendor?: boolean
}

const columnHelper = createColumnHelper<VendorUser>()

const VendorsEditTable: FC<VendorsEditProps> = ({
  data,
  control,
  paginationData,
  handlePaginationChange,
}) => {
  const { t } = useTranslation()

  const tableColumns = [
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const user = getValue()
        return (
          <span>
            {user}
            {/* {user?.forename} {user?.surname} */}
          </span>
        )
      },
    }),
    columnHelper.accessor('vendor', {
      header: () => t('vendors.vendor'),
      footer: (info) => info.column.id,
      cell: (info) => {
        return (
          <FormInput
            name={`${info.row.original.id}`}
            ariaLabel={t('vendors.vendor')}
            control={control}
            inputType={InputTypes.Checkbox}
          />
        )
      },
      meta: {
        size: 90,
      },
    }),
  ] as ColumnDef<VendorUser>[]

  return (
    <DataTable
      data={data}
      columns={tableColumns}
      tableSize={TableSizeTypes.M}
      className={classes.tableContainer}
      hidePaginationSelectionInput
      paginationData={paginationData}
      onPaginationChange={handlePaginationChange}
    />
  )
}

export default VendorsEditTable
