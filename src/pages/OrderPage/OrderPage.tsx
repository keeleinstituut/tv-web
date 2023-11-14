import Loader from 'components/atoms/Loader/Loader'
import { useFetchOrder } from 'hooks/requests/useOrders'
import { FC } from 'react'
import { map, includes, sortBy } from 'lodash'
import { useParams } from 'react-router-dom'
import classes from './classes.module.scss'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import { OrderStatus } from 'types/orders'
import OrderDetails, {
  OrderDetailModes,
} from 'components/organisms/OrderDetails/OrderDetails'
import useOrderPageRedirect from 'hooks/useOrderPageRedirect'
import SubOrderSection from 'components/templates/SubOrderSection/SubOrderSection'
interface OrderButtonProps {
  status?: OrderStatus
  isUserClientOfProject?: boolean
}

const OrderButtons: FC<OrderButtonProps> = ({
  status,
  isUserClientOfProject,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const isOrderCancellable = includes(
    [OrderStatus.New, OrderStatus.Registered],
    status
  )
  const canCancelPersonalOrder =
    includes(userPrivileges, Privileges.ViewPersonalProject) &&
    isUserClientOfProject

  const canCancelInstitutionOrder =
    status === OrderStatus.New &&
    includes(userPrivileges, Privileges.ManageProject)

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
        disabled
        // onClick={handleArchiveModal}
        hidden={!canCancelOrder}
      />
    </div>
  )
}

const OrderPage: FC = () => {
  // const { t } = useTranslation()
  const { orderId } = useParams()
  const { institutionUserId } = useAuth()
  const { order, isLoading } = useFetchOrder({ id: orderId })
  const {
    ext_id,
    status,
    sub_projects,
    client_institution_user,
    manager_institution_user,
    translation_domain_classifier_value,
  } = order || {}

  useOrderPageRedirect({
    client_institution_user_id: client_institution_user?.id,
    manager_institution_user_id: manager_institution_user?.id,
    isLoading,
  })

  const isUserClientOfProject =
    institutionUserId === client_institution_user?.id

  if (isLoading) return <Loader loading={isLoading} />
  return (
    <>
      <div className={classes.titleRow}>
        <h1>{ext_id}</h1>
        <OrderButtons {...{ status, isUserClientOfProject }} />
      </div>

      <OrderDetails mode={OrderDetailModes.Editable} order={order} />

      <div className={classes.separator} />

      {map(sortBy(sub_projects, 'ext_id'), (subOrder) => (
        <SubOrderSection
          {...subOrder}
          key={subOrder.id}
          projectDomain={translation_domain_classifier_value}
        />
      ))}
    </>
  )
}

export default OrderPage
