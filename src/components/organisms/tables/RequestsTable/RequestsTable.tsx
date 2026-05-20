import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'
import dayjs from 'dayjs'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { Root } from '@radix-ui/react-form'

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
  OutsourceRequest,
  OutsourceRequestFilters,
  OutsourceRequestMode,
  OutsourceRequestStatus,
} from 'types/projectRequests'
import {
  PaginationFunctionType,
  ResponseMetaTypes,
  SortingFunctionType,
} from 'types/collective'

type RequestRow = {
  id: string
  ext_id: string
  status: OutsourceRequestStatus
  mode: OutsourceRequestMode
  reaction_time_minutes: number
  deadline_at?: string | null
  created_at: string
}

const columnHelper = createColumnHelper<RequestRow>()

interface RequestsTableProps {
  requests: OutsourceRequest[]
  isLoading: boolean
  paginationData?: ResponseMetaTypes
  filters: OutsourceRequestFilters
  onPaginationChange?: (value?: PaginationFunctionType) => void
  onSortingChange?: (value?: SortingFunctionType) => void
}

const formatDate = (iso?: string | null) =>
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
        ext_id: r.id.slice(0, 8),
        status: r.status,
        mode: r.mode,
        reaction_time_minutes: r.reaction_time_minutes,
        deadline_at: r.deadline_at ?? undefined,
        created_at: r.created_at,
      })),
    [requests]
  )

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('ext_id', {
          header: () => t('requests.table.request_id'),
          cell: ({ row }) => (
            <Button
              appearance={AppearanceTypes.Text}
              size={SizeTypes.M}
              icon={ArrowRight}
              iconPositioning={IconPositioningTypes.Left}
              href={`/projects/requests/${row.original.id}`}
              ariaLabel={t('requests.table.request_id')}
            >
              {row.original.ext_id}
            </Button>
          ),
        }),
        columnHelper.accessor('mode', {
          header: () => t('requests.table.mode'),
          cell: ({ getValue }) => t(`requests.mode.${getValue()}`),
        }),
        columnHelper.accessor('reaction_time_minutes', {
          header: () => t('requests.table.reaction_time'),
          cell: ({ getValue }) =>
            t('requests.reaction_time_minutes', { count: getValue() }),
        }),
        columnHelper.accessor('status', {
          header: () => t('requests.table.status'),
          cell: ({ getValue }) => t(`requests.request_status.${getValue()}`),
        }),
        columnHelper.accessor('deadline_at', {
          header: () => t('requests.table.response_deadline'),
          cell: ({ getValue }) => formatDate(getValue()),
        }),
        columnHelper.accessor('created_at', {
          header: () => t('requests.table.created_at'),
          cell: ({ getValue }) => formatDate(getValue()),
        }),
      ] as ColumnDef<RequestRow>[],
    [t]
  )

  return (
    <Root>
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
    </Root>
  )
}

export default RequestsTable
