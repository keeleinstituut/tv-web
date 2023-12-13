import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { Root } from '@radix-ui/react-form'
import { map } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import classes from './classes.module.scss'
import dayjs from 'dayjs'
import { useFetchTranslationMemorySubProjects } from 'hooks/requests/useTranslationMemories'
import { useSearchParams } from 'react-router-dom'

type SubProjectTableRow = {
  id: string
  translation_domain: string
  created_at: string
}

const columnHelper = createColumnHelper<SubProjectTableRow>()
interface TmSubProjectsTypes {
  hidden: boolean
  memoryId: string
}

const TranslationMemorySubProjectsTable: FC<TmSubProjectsTypes> = ({
  hidden,
  memoryId,
}) => {
  const { t } = useTranslation()
  const [searchParams, _] = useSearchParams()
  const initialFilters = {
    ...Object.fromEntries(searchParams.entries()),
  }

  const { subProjects, paginationData, handlePaginationChange } =
    useFetchTranslationMemorySubProjects({
      id: memoryId,
      initialFilters: initialFilters,
      saveQueryParams: true,
    })

  const defaultPaginationData = {
    per_page: Number(searchParams.get('per_page')),
    page: Number(searchParams.get('page')) - 1,
  }

  const projectRows = useMemo(
    () =>
      map(
        subProjects,
        ({ created_at, ext_id, translation_domain_classifier_value }) => {
          return {
            id: ext_id,
            translation_domain: translation_domain_classifier_value?.name || '',
            created_at,
          }
        }
      ),
    [subProjects]
  )

  const columns = [
    columnHelper.accessor('id', {
      header: () => t('label.sub_project_id'),
      cell: ({ getValue }) => {
        return <span>{`# ${getValue()}`}</span>
      },
      footer: (info) => info.column.id,
      minSize: 300,
    }),
    columnHelper.accessor('translation_domain', {
      header: () => t('label.translation_domain'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('created_at', {
      header: () => t('label.created'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const formattedDate = dayjs(getValue()).format('DD.MM.YYYY')
        return <span>{formattedDate}</span>
      },
      size: 145,
    }),
  ] as ColumnDef<SubProjectTableRow>[]

  if (hidden) return null

  return (
    <Root>
      <DataTable
        data={projectRows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        title={t('label.related_subprojects')}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        className={classes.subProjectContainer}
        defaultPaginationData={defaultPaginationData}
      />
    </Root>
  )
}

export default TranslationMemorySubProjectsTable
