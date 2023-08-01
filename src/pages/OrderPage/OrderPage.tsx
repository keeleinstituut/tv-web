import Loader from 'components/atoms/Loader/Loader'
import { useFetchOrder } from 'hooks/requests/useOrders'
import { FC } from 'react'
import { includes, find } from 'lodash'
import { useParams } from 'react-router-dom'
import classes from './classes.module.scss'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import { OrderStatus } from 'types/orders'

// TODO: WIP - implement this page

interface OrderButtonProps {
  status?: OrderStatus
  isPersonalOrder?: boolean
  //
}

const OrderButtons: FC<OrderButtonProps> = ({ status, isPersonalOrder }) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const isOrderCancellable = includes(
    [OrderStatus.New, OrderStatus.Registered],
    status
  )
  const canCancelPersonalOrder =
    includes(userPrivileges, Privileges.ViewPersonalProject) && isPersonalOrder

  const canCancelInstitutionOrder =
    status === OrderStatus.New &&
    (includes(userPrivileges, Privileges.ManageProject) ||
      includes(userPrivileges, Privileges.ReceiveAndManageProject))

  //   RECEIVE_AND_MANAGE_PROJECT or MANAGE_PROJECT

  // const userHasPrivilege =
  //   !privileges ||
  //   find([Privileges.ReceiveAndManageProject, Privileges.ManageProject], (privilege) => includes(userPrivileges, privilege))

  //   RECEIVE_AND_MANAGE_PROJECT or MANAGE_PROJECT

  const canCancelOrder =
    isOrderCancellable && (canCancelPersonalOrder || canCancelInstitutionOrder)
  // TODO: mapped buttons:
  // Left:
  // 1. Delegate to other manager (Registreeritud status + )
  // Right:
  // 1. Cancel order --
  if (!status) return null
  return (
    <div className={classes.buttonsContainer}>
      <Button
        appearance={AppearanceTypes.Secondary}
        children={t('button.delegate_to_other_manager')}
        // TODO: disabled for now, we don't have endpoint for this
        // open confirmation modal from here
        disabled
        // hidden={!includes(userPrivileges, Privileges.DeactivateUser)}
      />
      <Button
        // loading={isArchiving}
        appearance={AppearanceTypes.Primary}
        children={t('button.cancel_order')}
        // onClick={handleArchiveModal}
        hidden={!canCancelOrder}
      />
    </div>
  )
}

const OrderPage: FC = () => {
  const { t } = useTranslation()
  const { orderId } = useParams()
  const { order, isLoading } = useFetchOrder({ orderId })
  const { id, status } = order || {}
  // TODO: check is "Tellija" of the order is current user
  const isPersonalOrder = true
  console.warn('orderPage', orderId, order)
  if (isLoading) return <Loader loading={isLoading} />
  return (
    <div className={classes.titleRow}>
      <h1>{id}</h1>
      <OrderButtons {...{ status, isPersonalOrder }} />
    </div>
  )
}

export default OrderPage
