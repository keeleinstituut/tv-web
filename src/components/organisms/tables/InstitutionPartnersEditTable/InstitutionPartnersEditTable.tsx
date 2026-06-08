import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { Control } from 'react-hook-form'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { FormInput } from 'components/organisms/DynamicForm/DynamicForm'
import { InputTypes } from 'components/organisms/DynamicInputComponent/DynamicInputComponent'
import { PaginationFunctionType, ResponseMetaTypes } from 'types/collective'
import classes from './classes.module.scss'

export type InstitutionRow = {
  institutionId: string
  name?: string | null
  short_name?: string | null
  partner_id?: string
}

export interface InstitutionPartnersEditTableProps {
  data: InstitutionRow[]
  control: Control
  paginationData?: ResponseMetaTypes
  handlePaginationChange?: (value?: PaginationFunctionType) => void
}

const columnHelper = createColumnHelper<InstitutionRow>()

const InstitutionPartnersEditTable: FC<InstitutionPartnersEditTableProps> = ({
  data,
  control,
  paginationData,
  handlePaginationChange,
}) => {
  const { t } = useTranslation()

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('name', {
          header: () => t('label.institution'),
          footer: (info) => info.column.id,
          cell: ({ getValue }) => <span>{getValue()}</span>,
        }),
        columnHelper.accessor('short_name', {
          header: () => t('label.institution_short'),
          footer: (info) => info.column.id,
          cell: ({ getValue }) => <span>{getValue()}</span>,
        }),
        columnHelper.accessor('partner_id', {
          header: () => t('label.external_partner'),
          footer: (info) => info.column.id,
          cell: (info) => (
            <>
              <FormInput
                name={`${info.row.original.institutionId}.isPartner`}
                ariaLabel={info.row.original.name || t('label.external_partner')}
                control={control}
                defaultValue={!!info.row.original.partner_id}
                inputType={InputTypes.Checkbox}
                errorZIndex={100}
              />
              <FormInput
                name={`${info.row.original.institutionId}.partner_id`}
                ariaLabel={t('label.external_partner')}
                control={control}
                defaultValue={info.row.original.partner_id ?? ''}
                inputType={InputTypes.Text}
                className={classes.partnerId}
              />
            </>
          ),
          size: 90,
        }),
      ] as ColumnDef<InstitutionRow>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [control, data]
  )

  return (
    <DataTable
      data={data}
      columns={columns}
      tableSize={TableSizeTypes.M}
      className={classes.tableContainer}
      hidePaginationSelectionInput
      paginationData={paginationData}
      onPaginationChange={handlePaginationChange}
    />
  )
}

export default InstitutionPartnersEditTable
