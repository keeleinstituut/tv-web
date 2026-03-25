import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { Root } from '@radix-ui/react-form'
import { map } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import classes from './classes.module.scss'
import dayjs from 'dayjs'
import {
  useCreateTranslationMemoryContextCheck,
  useFetchTranslationMemoryContextChecks,
} from 'hooks/requests/useTranslationMemories'
import Button from 'components/molecules/Button/Button'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'

type ContextCheckTableRow = {
  id: string
  status: string
  progress: number | null
  is_clean: boolean | null
  finished_at: string | null
  created_at: string
}

const columnHelper = createColumnHelper<ContextCheckTableRow>()

interface TmSubProjectsTypes {
  hidden: boolean
  memoryId: string
}

const TranslationMemoryContentChecksTable: FC<TmSubProjectsTypes> = ({
  hidden,
  memoryId,
}) => {
  const { t } = useTranslation()

  const {
    contextChecks,
    paginationData,
    handlePaginationChange,
    refetch: refetchContentChecks,
  } = useFetchTranslationMemoryContextChecks({
    initialFilters: {
      tag_id: memoryId,
    },
  })

  const { createContextCheck } = useCreateTranslationMemoryContextCheck()

  const dataRows: ContextCheckTableRow[] = useMemo(() => {
    return map(contextChecks, (contextCheck) => {
      const {
        id,
        status,
        segments_checked_count,
        segments_count,
        segments_failed_count,
        finished_at,
        created_at,
      } = contextCheck
      const is_clean =
        segments_failed_count === null ? null : segments_failed_count === 0

      return {
        id,
        status,
        progress:
          segments_checked_count == null || segments_count == null
            ? null
            : segments_checked_count / segments_count,
        is_clean,
        finished_at,
        created_at,
      }
    })
  }, [contextChecks])

  const handleCreateContextCheck = useCallback(async () => {
    await createContextCheck({
      tag_id: memoryId,
    })
    refetchContentChecks()
  }, [createContextCheck, refetchContentChecks, memoryId])

  const columns = [
    columnHelper.accessor('id', {
      // header: () => t('label.sub_project_id'),
      header: () => 'ID',
      footer: (info) => info.column.id,
      minSize: 300,
    }),
    columnHelper.accessor('status', {
      // header: () => t('label.translation_domain'),
      header: () => 'Staatus',
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const value = getValue()
        const translatedType = t(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          `translation_memories.content_check_status.${value}` as any
        )
        return <span>{translatedType}</span>
      },
    }),
    columnHelper.accessor('progress', {
      // header: () => t('label.translation_domain'),
      header: () => 'Progress',
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const value = getValue()
        if (value === null) {
          return <span></span>
        }

        const formatted = (value * 100).toFixed(1)
        return <span>{formatted}%</span>
      },
    }),
    columnHelper.accessor('is_clean', {
      // header: () => t('label.translation_domain'),
      header: () => 'Tulemus',
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const value = getValue()

        if (value === null) {
          return <span></span>
        } else if (value) {
          return <span>Puhas</span>
        } else {
          return <span>Sisaldab tundlikku infot</span>
        }
      },
    }),
    columnHelper.accessor('finished_at', {
      // header: () => t('label.created'),
      header: () => 'Lõppenud',
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const value = getValue()
        if (value === null) {
          return <span></span>
        }

        const formattedDate = dayjs(value, 'YYYYMMDDTHHmmssZ').format(
          'DD.MM.YYYY HH:mm'
        )
        return <span>{formattedDate}</span>
      },
      size: 145,
    }),
    columnHelper.accessor('created_at', {
      header: () => t('label.created'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const formattedDate = dayjs(getValue(), 'YYYYMMDDTHHmmssZ').format(
          'DD.MM.YYYY HH:mm'
        )
        return <span>{formattedDate}</span>
      },
      size: 145,
    }),
  ] as ColumnDef<ContextCheckTableRow>[]

  if (hidden) return null

  return (
    <Root>
      <DataTable
        data={dataRows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        className={classes.subProjectContainer}
        headComponent={
          <div className={classes.headComponentContainer}>
            <h4>Sisukontrollid</h4>
            <div className={classes.newButtonContainer}>
              <SmallTooltip
                tooltipContent={t(
                  'tooltip.translation_memories_bulk_export_button'
                )}
                className={classes.newButtonTooltip}
              />
              <Button onClick={handleCreateContextCheck}>
                Käivita uus sisukontroll
              </Button>
            </div>
          </div>
        }
      />
    </Root>
  )
}

export default TranslationMemoryContentChecksTable
