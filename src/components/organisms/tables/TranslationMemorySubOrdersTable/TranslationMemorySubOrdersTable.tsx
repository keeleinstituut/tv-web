import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { Root } from '@radix-ui/react-form'
import { map } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import classes from './classes.module.scss'

import { useFetchSubOrders } from 'hooks/requests/useOrders'
import { SubOrderStatus } from 'types/orders'
import dayjs from 'dayjs'

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

  //TODO: add correct endpoint if BE is ready
  const { subOrders, paginationData, handlePaginationChange } =
    useFetchSubOrders()

  // TODO: remove hardcoded default values, once we have actual data
  const orderRows = useMemo(
    () =>
      map(
        subOrders,
        ({
          deadline_at,
          ext_id,
          status = SubOrderStatus.ForwardedToVendor,
        }) => {
          return {
            id: ext_id,
            translation_domain: status,
            created_at: deadline_at,
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
