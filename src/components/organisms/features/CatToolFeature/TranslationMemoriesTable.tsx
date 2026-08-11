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
import { chain } from "lodash"
import Button, { AppearanceTypes, SizeTypes } from "components/molecules/Button/Button"
import { ModalTypes, showModal } from "components/organisms/modals/ModalRoot"
import classes from "./classes.module.scss"

interface CatTranslationMemory {
  id: string
  name: string
  source_locale: string
  target_locale: string
}

interface CatProjectTranslationMemory {
  id: string
  read: boolean
  write: boolean
}

interface CatTmRow extends CatTranslationMemory {
  read: boolean
  write: boolean
  segment_count: number
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

  const addNewTm = () => {
    showModal(ModalTypes.AddTranslationMemories, { catProjectId })
  }

  const createEmptyTm = () => {
    // TODO: wire up empty TM creation
  }

  const rows: CatTmRow[] = useMemo(() => {
    const allTms: CatTranslationMemory[] = catTmsQuery.data?.data || []
    const segmentCounts: Record<string, number> = catTmsQuery.data?.segment_counts || {}

    return chain(allTms)
      .filter(tm => assignedMap.has(tm.id))
      .map(tm => {
        const assigned = assignedMap.get(tm.id)
        return {
          ...tm,
          read: assigned?.read ?? false,
          write: assigned?.write ?? false,
          segment_count: segmentCounts[tm.id] ?? 0,
        }
      })
      .value()
  }, [catTmsQuery.data, assignedMap])

  const handleToggle = useCallback(
    (tmId: string, field: 'read' | 'write', checked: boolean) => {
      const next = rows.map((row) =>
        row.id === tmId ? { ...row, [field]: checked } : row
      )
      const translation_memories = next
        .map(({ id, read, write }) => ({ id, read, write }))
      updateMutation.mutate(translation_memories)
    },
    [rows, updateMutation]
  )

  const columns = [
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
    columnHelper.accessor('name', {
      header: () => t('label.tag_name'),
      footer: (info) => info.column.id,
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
    columnHelper.accessor('segment_count', {
      header: () => t('label.chunk_amount'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => getValue() ?? 0,
    }),
  ] as ColumnDef<CatTmRow>[]

  return (
    <ExpandableContentContainer
      className={classes.expandableContainer}
      initialIsExpanded
      wrapContent
      leftComponent={<h3>{t('cat_tool_feature.translation_memories')}</h3>}
      rightComponent={<>
        <Button
          appearance={AppearanceTypes.Secondary}
          children={t('button.create_empty_tm')}
          size={SizeTypes.S}
          onClick={createEmptyTm}
        />
        <Button
          children={t('button.add_tm')}
          size={SizeTypes.S}
          className={classes.mainButton}
          onClick={addNewTm}
        />
      </>}
    >
      <DataTable
        data={rows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        className={classes.translationMemoriesTable}
        hidePagination
      />
    </ExpandableContentContainer>
  )
}

export default TranslationMemoriesTable
