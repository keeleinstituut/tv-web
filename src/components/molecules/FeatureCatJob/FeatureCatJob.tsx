import { useMemo } from 'react'
import { map, isEmpty } from 'lodash'
import { CatJob } from 'types/orders'
import { AssignmentType } from 'types/assignments'
import { useTranslation } from 'react-i18next'
import { Control, FieldValues, Path } from 'react-hook-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'
import classNames from 'classnames'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'

import classes from './classes.module.scss'
interface FeatureCatJobProps<TFormValues extends FieldValues>
  extends AssignmentType {
  index: number
  subOrderCatJobs?: CatJob[]
  // cat_jobs?: CatJob[]
  control: Control<TFormValues>
  isEditable?: boolean
}
interface TableRow {
  selected: string
  chunk_id: string
}

const columnHelper = createColumnHelper<TableRow>()

const FeatureCatJob = <TFormValues extends FieldValues>({
  index,
  control,
  id,
  job_definition,
  // candidates,
  // assigned_vendor_id,
  // assignee,
  // finished_at,
  subOrderCatJobs,
  isEditable,
}: FeatureCatJobProps<TFormValues>) => {
  const { t } = useTranslation()

  const tableRows = useMemo(
    () =>
      map(subOrderCatJobs, ({ id }) => ({
        selected: id.toString(),
        chunk_id: id.toString(),
      })),
    [subOrderCatJobs]
  )

  const columns = [
    columnHelper.accessor('selected', {
      header: () => '',
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return (
          <FormInput
            name={`${id}.${getValue()}` as Path<TFormValues>}
            ariaLabel={t('label.assign_source_file')}
            control={control}
            inputType={InputTypes.Checkbox}
            disabled={!isEditable}
          />
        )
      },
    }),
    columnHelper.accessor('chunk_id', {
      header: () => t('label.xliff_name'),
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<TableRow>[]

  return (
    <div className={classes.container}>
      <h3>
        {t('task.vendor_title', { number: index + 1 })}(
        {t(`orders.features.${job_definition.job_key}`)})
      </h3>
      <span className={classes.assignmentId}>{id}</span>
      <div className={classes.titleRow}>
        <h4>{t('orders.source_files_in_translation_tool')}</h4>

        <SmallTooltip
          tooltipContent={t('tooltip.source_files_in_translation_tool_helper')}
        />
      </div>
      <p
        className={classNames(
          classes.emptyTableText,
          isEmpty(subOrderCatJobs) && classes.visible
        )}
      >
        {t('task.files_not_generated')}
      </p>
      <DataTable
        data={tableRows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        className={classes.tableContainer}
        hidden={isEmpty(subOrderCatJobs)}
        hidePagination
      />
    </div>
  )
}

export default FeatureCatJob
