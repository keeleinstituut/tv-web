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
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import TranslationMemoryDetails from 'components/organisms/TranslationMemoryDetails/TranslationMemoryDetails'

// TODO: WIP - implement this page

const TranslationMemoryPage: FC = () => {
  const { t } = useTranslation()

  const { orderId } = useParams()
  const { institutionUserId } = useAuth()

  // useOrderPageRedirect({
  //   client_user_institution_id,
  //   translation_manager_user_institution_id,
  //   isLoading,
  // })

  // const isUserClientOfProject = institutionUserId === client_user_institution_id

  // if (isLoading) return <Loader loading={isLoading} />

  //Todo change the title
  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('translation_memories.new_translation_memory_title')}</h1>
        <Tooltip
          title={t('cheat_sheet.user_management.title')}
          //modalContent={}
        />
      </div>
      <TranslationMemoryDetails memoryId={orderId} />

      {/* <OrderDetails
        mode={OrderDetailModes.Editable}
        order={order}
        isUserClientOfProject={isUserClientOfProject}
      />

      {map(sortBy(sub_projects, 'ext_id'), (subOrder) => (
        <div key={subOrder.id}>{subOrder.id}</div>
      ))} */}
    </>
  )
}

export default TranslationMemoryPage
