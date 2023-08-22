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
// import SubOrderSection from 'components/templates/SubOrderSection/SubOrderSection'
import OrderDetails, {
  OrderDetailModes,
} from 'components/organisms/OrderDetails/OrderDetails'
import useOrderPageRedirect from 'hooks/useOrderPageRedirect'

// TODO: WIP - implement this page

const TranslationMemoryPage: FC = () => {
  // const { t } = useTranslation()
  const { orderId } = useParams()
  const { institutionUserId } = useAuth()
  const { order, isLoading } = useFetchOrder({ orderId })
  const {
    id,
    status,
    sub_projects,
    client_user_institution_id,
    translation_manager_user_institution_id,
  } = order || {}

  useOrderPageRedirect({
    client_user_institution_id,
    translation_manager_user_institution_id,
    isLoading,
  })

  const isUserClientOfProject = institutionUserId === client_user_institution_id

  if (isLoading) return <Loader loading={isLoading} />
  return (
    <>
      <div className={classes.titleRow}>
        <h1>{id}</h1>
      </div>

      <OrderDetails
        mode={OrderDetailModes.Editable}
        order={order}
        isUserClientOfProject={isUserClientOfProject}
      />

      {map(sortBy(sub_projects, 'ext_id'), (subOrder) => (
        <div key={subOrder.id}>{subOrder.id}</div>
      ))}
    </>
  )
}

export default TranslationMemoryPage
