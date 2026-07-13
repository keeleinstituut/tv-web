import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import Delete from 'assets/icons/delete.svg?react'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import classes from './classes.module.scss'

interface UploadedFilesListProps {
  files: File[]
  title?: string
  onDelete?: (index: number) => void
}

interface FileRow {
  name: string
  size: string
  delete_button: number
}

const columnHelper = createColumnHelper<FileRow>()

const formatFileSize = (sizeInBytes: number): string => {
  const kilobytes = sizeInBytes / 1024
  if (kilobytes < 1024) return `${kilobytes.toFixed(2)} KB`
  return `${(kilobytes / 1024).toFixed(2)} MB`
}

const UploadedFilesList: FC<UploadedFilesListProps> = ({
  files,
  title,
  onDelete,
}) => {
  const { t } = useTranslation()

  const rows = useMemo(
    () =>
      files.map((file, index) => ({
        name: file.name,
        size: formatFileSize(file.size),
        delete_button: index,
      })),
    [files]
  )

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('name', {
          header: () => t('label.file_name'),
          footer: (info) => info.column.id,
        }),
        columnHelper.accessor('size', {
          header: () => t('label.file_size'),
          footer: (info) => info.column.id,
        }),
        ...(onDelete
          ? [
              columnHelper.accessor('delete_button', {
                header: '',
                cell: ({ getValue }) => (
                  <BaseButton
                    className={classes.iconButton}
                    onClick={() => onDelete(getValue())}
                    aria-label={t('button.delete')}
                  >
                    <Delete />
                  </BaseButton>
                ),
                footer: (info) => info.column.id,
              }),
            ]
          : []),
      ] as ColumnDef<FileRow>[],
    [onDelete, t]
  )

  if (files.length === 0) {
    return <span>{t('requests.files_none')}</span>
  }

  return (
    <div className={classes.container}>
      <DataTable
        data={rows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        className={classes.filesListContainer}
        hidePagination
        headComponent={
          title ? (
            <div className={classes.titleRow}>
              <h3>{title}</h3>
            </div>
          ) : undefined
        }
      />
    </div>
  )
}

export default UploadedFilesList
