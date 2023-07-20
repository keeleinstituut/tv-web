import Button from 'components/molecules/Button/Button'
import { FC } from 'react'
import { includes } from 'lodash'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import OrdersTable from 'components/organisms/tables/OrdersTable/OrdersTable'

// TODO: WIP - implement this page

const Orders: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('orders.orders_tile')}</h1>
        {/* TODO: add tooltip */}
        <Button
          children={t('button.add_order')}
          href="/orders/new-order"
          hidden={!includes(userPrivileges, Privileges.CreateProject)}
        />
      </div>
      <OrdersTable />
    </>
  )
}

export default Orders
