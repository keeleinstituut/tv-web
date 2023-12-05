import { FC, useMemo } from 'react'
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
  data: VendorUser[]
  control: Control
  handlePaginationChange?: (value?: PaginationFunctionType) => void
  paginationData?: ResponseMetaTypes
}

export type VendorUser = {
  institution_user_id: string
  name?: string
  vendor_id?: string
}

const columnHelper = createColumnHelper<VendorUser>()

const VendorsEditTable: FC<VendorsEditProps> = ({
  data,
  control,
  paginationData,
  handlePaginationChange,
}) => {
  const { t } = useTranslation()

  const tableColumns = useMemo(
    () =>
      [
        columnHelper.accessor('name', {
          header: () => t('label.name'),
          footer: (info) => info.column.id,
          cell: ({ getValue }) => {
            const user = getValue()
            return <span>{user}</span>
          },
        }),
        columnHelper.accessor('vendor_id', {
          header: () => t('vendors.vendor'),
          footer: (info) => info.column.id,
          cell: (info) => {
            return (
              <>
                <FormInput
                  name={`${info.row.original.institution_user_id}.isVendor`}
                  ariaLabel={info.row.original.name || t('vendors.vendor')}
                  control={control}
                  defaultValue={!!info.row.original.vendor_id}
                  inputType={InputTypes.Checkbox}
                  errorZIndex={100}
                />
                <FormInput
                  name={`${info.row.original.institution_user_id}.vendor_id`}
                  ariaLabel={t('vendors.vendor')}
                  control={control}
                  defaultValue={info.row.original.vendor_id}
                  inputType={InputTypes.Text}
                  className={classes.vendorId}
                />
              </>
            )
          },
          size: 90,
        }),
      ] as ColumnDef<VendorUser>[],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [control, data]
  )

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
