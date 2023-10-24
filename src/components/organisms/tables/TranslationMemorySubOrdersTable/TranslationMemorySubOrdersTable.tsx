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
import { useFetchTranslationMemorySubOrders } from 'hooks/requests/useTranslationMemories'

type SubOrderTableRow = {
  id: string
  translation_domain: string
  created_at: string
}

const columnHelper = createColumnHelper<SubOrderTableRow>()
interface TmSubOrdersTypes {
  hidden: boolean
  memoryId: string
}

const TranslationMemorySubOrdersTable: FC<TmSubOrdersTypes> = ({
  hidden,
  memoryId,
}) => {
  const { t } = useTranslation()
  const { subOrders, paginationData, handlePaginationChange } =
    useFetchTranslationMemorySubOrders({
      id: memoryId,
    })

  console.log(subOrders)

  const orderRows = useMemo(
    () =>
      map(
        subOrders,
        ({ created_at, ext_id, translation_domain_classifier_value }) => {
          return {
            id: ext_id,
            translation_domain: translation_domain_classifier_value?.name || '',
            created_at,
          }
        }
      ),
    [subOrders]
  )

  const columns = [
    columnHelper.accessor('id', {
      header: () => t('label.sub_order_id'),
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
  ] as ColumnDef<SubOrderTableRow>[]

  if (hidden) return null

  return (
    <Root>
      <DataTable
        data={orderRows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        title={t('label.related_suborders')}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        className={classes.subOrderContainer}
      />
    </Root>
  )
}

export default TranslationMemorySubOrdersTable
