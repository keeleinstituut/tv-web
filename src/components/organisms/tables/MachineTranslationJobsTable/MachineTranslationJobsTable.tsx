import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import DownloadIcon from 'assets/icons/download.svg?react'
import { Root } from '@radix-ui/react-form'
import { useFetchMTJobs } from 'hooks/requests/useMachineTranslation'
import { TranslationJob } from 'types/machineTranslation'
import { endpoints } from 'api/endpoints'
import dayjs from 'dayjs'
import classes from './classes.module.scss'
import Tag from 'components/atoms/Tag/Tag'

type JobRow = {
  id: string
  created_at: string
  type: string
  provider: string
  languages: string
  status: string
  original_filename?: string | null
  is_downloadable: boolean
}

const columnHelper = createColumnHelper<JobRow>()

const MachineTranslationJobsTable: FC = () => {
  const { t } = useTranslation()
  const { jobs, paginationData, handlePaginationChange } =
    useFetchMTJobs({ per_page: 15, type: 'file' })

  const tableData: JobRow[] = useMemo(
    () =>
      jobs.map((job: TranslationJob) => ({
        id: job.id,
        created_at: job.created_at
          ? dayjs(job.created_at).format('YYYY.MM.DD HH:mm')
          : '—',
        type:
          job.type === 'file'
            ? t('machine_translation.job_type_file')
            : t('machine_translation.job_type_text'),
        provider:
          job.provider === 'etranslation'
            ? t('machine_translation.provider_etranslation')
            : t('machine_translation.provider_azure_openai'),
        languages: `${job.source_language.toUpperCase()} > ${job.target_language.toUpperCase()}`,
        status: t(`machine_translation.file_status_${job.status}` as any),
        original_filename: job.original_filename,
        is_downloadable: job.type === 'file' && job.status === 'completed',
      })),
    [jobs, t]
  )

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('created_at', {
          header: () => t('machine_translation.column_date'),
          cell: ({ getValue }) => <span>{getValue()}</span>,
          size: 150,
        }),
        columnHelper.accessor('languages', {
          header: () => t('machine_translation.column_languages'),
          cell: ({ getValue }) => {
            const value = getValue()

            return (
              <Tag label={value} value key={value} />
            )
          },
          size: 120,
        }),
        columnHelper.accessor('provider', {
          header: () => t('machine_translation.column_provider'),
          cell: ({ getValue }) => <span>{getValue()}</span>,
          size: 140,
        }),
        columnHelper.accessor('type', {
          header: () => t('machine_translation.column_type'),
          cell: ({ getValue }) => <span>{getValue()}</span>,
          size: 80,
        }),
        columnHelper.accessor('original_filename', {
          header: () => t('machine_translation.column_original_filename'),
          cell: ({ getValue }) => <span>{getValue()}</span>,
          size: 140,
        }),
        columnHelper.accessor('status', {
          header: () => t('machine_translation.column_status'),
          cell: ({ getValue }) => <span>{getValue()}</span>,
          size: 140,
        }),
        columnHelper.display({
          id: 'actions',
          header: () => null,
          cell: ({ row }) =>
            row.original.is_downloadable ? (
              <a
                href={endpoints.MT_FILE_DOWNLOAD(row.original.id)}
                download={row.original.original_filename ?? undefined}
                className={classes.downloadLink}
              >
                <Button
                  appearance={AppearanceTypes.Secondary}
                  size={SizeTypes.M}
                  icon={DownloadIcon}
                  ariaLabel={t('machine_translation.download_button')}
                />
              </a>
            ) : null,
          size: 60,
        }),
      ] as ColumnDef<JobRow>[],
    [t]
  )

  return (
    <Root onSubmit={(e) => e.preventDefault()}>
      <DataTable
        data={tableData}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        defaultPaginationData={{ per_page: 15 }}
        pageSizeOptions={[
          { label: '15', value: '15' },
          { label: '50', value: '50' },
        ]}
      />
    </Root>
  )
}

export default MachineTranslationJobsTable
