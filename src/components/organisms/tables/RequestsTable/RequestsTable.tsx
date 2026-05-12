import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'
import dayjs from 'dayjs'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'

import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import ArrowRight from 'assets/icons/arrow_right.svg?react'
import {
  ProjectRequest,
  ProjectRequestFilters,
  ProjectRequestStatus,
} from 'types/projectRequests'

type RequestRow = {
  id: string
  project_ext_id: string
  requestor: string
  requestor_email: string
  project_type: string
  language_pair: string
  status: ProjectRequestStatus
  response_deadline_at?: string
}

const columnHelper = createColumnHelper<RequestRow>()

interface RequestsTableProps {
  requests: ProjectRequest[]
  isLoading: boolean
  paginationData?: import('types/collective').ResponseMetaTypes
  filters: ProjectRequestFilters
  onPaginationChange?: (
    value?: import('types/collective').PaginationFunctionType
  ) => void
  onSortingChange?: (
    value?: import('types/collective').SortingFunctionType
  ) => void
}

const formatDeadline = (iso?: string) =>
  iso ? dayjs(iso).format('DD.MM.YYYY HH:mm') : '-'

const RequestsTable: FC<RequestsTableProps> = ({
  requests,
  paginationData,
  onPaginationChange,
  onSortingChange,
}) => {
  const { t } = useTranslation()

  const rows = useMemo<RequestRow[]>(
    () =>
      map(requests, (r) => ({
        id: r.id,
        project_ext_id: r.project_ext_id ?? '-',
        requestor: r.requestor_institution_name ?? '-',
        requestor_email: r.requestor_email ?? '-',
        project_type: r.project_type_name ?? '-',
        language_pair: r.language_pair ?? '-',
        status: r.status,
        response_deadline_at: r.response_deadline_at,
      })),
    [requests]
  )

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('project_ext_id', {
          header: () => t('requests.table.project_id'),
          cell: ({ row }) => (
            <Button
              appearance={AppearanceTypes.Text}
              size={SizeTypes.M}
              icon={ArrowRight}
              iconPositioning={IconPositioningTypes.Left}
              href={`/projects/requests/${row.original.id}`}
              ariaLabel={t('requests.table.project_id')}
            >
              {row.original.project_ext_id}
            </Button>
          ),
        }),
        columnHelper.accessor('requestor', {
          header: () => t('requests.table.requestor'),
        }),
        columnHelper.accessor('requestor_email', {
          header: () => t('requests.table.requestor_email'),
        }),
        columnHelper.accessor('project_type', {
          header: () => t('requests.table.project_type'),
        }),
        columnHelper.accessor('language_pair', {
          header: () => t('requests.table.language_pair'),
        }),
        columnHelper.accessor('status', {
          header: () => t('requests.table.status'),
          cell: ({ getValue }) => t(`requests.status.${getValue()}`),
        }),
        columnHelper.accessor('response_deadline_at', {
          header: () => t('requests.table.response_deadline'),
          cell: ({ getValue }) => formatDeadline(getValue()),
        }),
      ] as ColumnDef<RequestRow>[],
    [t]
  )

  return (
    <DataTable
      data={rows}
      columns={columns}
      tableSize={TableSizeTypes.M}
      paginationData={paginationData}
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
      pageSizeOptions={[
        { label: '10', value: '10' },
        { label: '25', value: '25' },
        { label: '50', value: '50' },
      ]}
    />
  )
}

export default RequestsTable
