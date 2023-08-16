import SubOrdersTable from 'components/organisms/tables/SubOrdersTable/SubOrdersTable'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'

// TODO: WIP - implement this page

const SubOrders: FC = () => {
  const { t } = useTranslation()
  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('orders.sub_orders_tile')}</h1>
        {/* TODO: add tooltip */}
      </div>
      <SubOrdersTable />
    </>
  )
}

export default SubOrders
