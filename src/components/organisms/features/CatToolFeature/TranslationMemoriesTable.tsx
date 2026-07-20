import { FC, useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import DataTable, { TableSizeTypes } from "components/organisms/DataTable/DataTable"
import ExpandableContentContainer from "components/molecules/ExpandableContentContainer/ExpandableContentContainer"
import Tag from "components/atoms/Tag/Tag"
import {
  useCatProject,
  useCatTranslationMemoriesList,
  useUpdateCatProjectTranslationMemories,
} from "./useCatTranslationMemories"

interface CatTranslationMemory {
  id: string
  name: string
  source_locale: string
  target_locale: string
  segment_count?: number
}

interface CatProjectTranslationMemory {
  id: string
  read: boolean
  write: boolean
}

interface CatTmRow extends CatTranslationMemory {
  read: boolean
  write: boolean
}

const columnHelper = createColumnHelper<CatTmRow>()

interface TranslationMemoriesTableProps {
  catProjectId: string
}

const TranslationMemoriesTable: FC<TranslationMemoriesTableProps> = ({
  catProjectId,
}) => {
  const { t } = useTranslation()

  const catProjectQuery = useCatProject(catProjectId)
  const catTmsQuery = useCatTranslationMemoriesList()
  const updateMutation = useUpdateCatProjectTranslationMemories(catProjectId)

  const assignedMap = useMemo(() => {
    const map = new Map<string, { read: boolean; write: boolean }>()
    const assigned: CatProjectTranslationMemory[] =
      catProjectQuery.data?.data?.translation_memories || []
    assigned.forEach((tm) => map.set(tm.id, { read: tm.read, write: tm.write }))
    return map
  }, [catProjectQuery.data])

  const rows: CatTmRow[] = useMemo(() => {
    const allTms: CatTranslationMemory[] = catTmsQuery.data?.data || []
    return allTms.map((tm) => ({
      ...tm,
      read: assignedMap.get(tm.id)?.read ?? false,
      write: assignedMap.get(tm.id)?.write ?? false,
    }))
  }, [catTmsQuery.data, assignedMap])

  const handleToggle = useCallback(
    (tmId: string, field: 'read' | 'write', checked: boolean) => {
      const next = rows.map((row) =>
        row.id === tmId ? { ...row, [field]: checked } : row
      )
      const translation_memories = next
        .filter((row) => row.read || row.write)
        .map(({ id, read, write }) => ({ id, read, write }))
      updateMutation.mutate(translation_memories)
    },
    [rows, updateMutation]
  )

  const columns = [
    columnHelper.accessor('name', {
      header: () => t('label.tag_name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('id', {
      id: 'language_direction',
      header: () => t('label.language_direction'),
      footer: (info) => info.column.id,
      cell: ({ row }) => (
        <Tag
          label={`${row.original.source_locale} → ${row.original.target_locale}`}
          value
        />
      ),
    }),
    columnHelper.accessor('segment_count', {
      header: () => t('label.chunks'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => getValue() ?? 0,
    }),
    columnHelper.accessor('read', {
      header: () => t('translation_memory.read'),
      footer: (info) => info.column.id,
      cell: ({ row, getValue }) => (
        <input
          type="checkbox"
          checked={getValue()}
          disabled={updateMutation.isLoading}
          onChange={(e) =>
            handleToggle(row.original.id, 'read', e.currentTarget.checked)
          }
        />
      ),
    }),
    columnHelper.accessor('write', {
      header: () => t('translation_memory.write'),
      footer: (info) => info.column.id,
      cell: ({ row, getValue }) => (
        <input
          type="checkbox"
          checked={getValue()}
          disabled={updateMutation.isLoading}
          onChange={(e) =>
            handleToggle(row.original.id, 'write', e.currentTarget.checked)
          }
        />
      ),
    }),
  ] as ColumnDef<CatTmRow>[]

  return (
    <ExpandableContentContainer
      initialIsExpanded
      wrapContent
      leftComponent={<h3>{t('translation_memory.title')}</h3>}
    >
      <DataTable
        data={rows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        hidePagination
      />
    </ExpandableContentContainer>
  )
}

export default TranslationMemoriesTable
