import Loader from 'components/atoms/Loader/Loader'
import {
  useFetchOrder,
  useFetchSubOrder,
  useSubOrderSendToCat,
} from 'hooks/requests/useOrders'
import { FC, Fragment, useState } from 'react'
import { includes, find, map, chain, assign, filter, split, zip } from 'lodash'
import { useParams } from 'react-router-dom'
import classes from './classes.module.scss'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import { OrderStatus } from 'types/orders'
import Tag from 'components/atoms/Tag/Tag'
import Tabs from 'components/molecules/Tabs/Tabs'
import SimpleDropdown from 'components/molecules/SimpleDropdown/SimpleDropdown'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import ConfirmationModalBase from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import _ from 'lodash'
import SubOrderSection from 'components/templates/SubOrderSection/SubOrderSection'
import OrderDetails, {
  OrderDetailModes,
} from 'components/organisms/OrderDetails/OrderDetails'

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
  if (isLoading) return <Loader loading={isLoading} />
  return (
    <div>
      <div className={classes.titleRow}>
        <h1>{id}</h1>
        <OrderButtons {...{ status, isPersonalOrder }} />
      </div>

      <OrderDetails mode={OrderDetailModes.Editable} order={order} />

      {/* <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h5>Tellija andmed</h5>
          <span>Nimi: 1</span>
          <span>Asutus: 2</span>
          <span>Üksus: 3</span>
          <span>Meiliaadress: 4</span>
          <span>Telefoninumber: 5</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h5>Tõlkekorraldaja andmed</h5>
          <span>Nimi: 1</span>
          <span>Asutus: 2</span>
          <span>Üksus: 3</span>
          <span>Meiliaadress: 4</span>
          <span>Telefoninumber: 5</span>
        </div>
      </div> */}
      <br></br>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h5>Tellimuse andmed</h5>
          <span>Tellimuse ID: {order?.ext_id}</span>
          <span>Valdkond: 2</span>
          <span>Tellimuse tüüp: {order?.type_classifier_value?.name}</span>
          <span>Tähtaeg: 4</span>
          <span>Lisainfo: 5</span>
          <span>Viitenumber: {order?.reference_number}</span>
          <span>
            Algkeel:{' '}
            {chain(order?.sub_projects)
              .map('source_language_classifier_value')
              .map('name')
              .uniq()
              .join(', ')
              .value()}
          </span>
          <span>
            Sihtkeel(ed):{' '}
            {chain(order?.sub_projects)
              .map('destination_language_classifier_value')
              .map('name')
              .uniq()
              .join(', ')
              .value()}
          </span>
          <span>Tellimuse sildid: 9</span>
          <span>Loomise aeg: {order?.created_at}</span>
          <span>Tühistamise aeg: 11</span>
          <span>Tagasilükkamise aeg: 12</span>
          <span>Korrektuuride tegemise aeg: 13</span>
          <span>Vastuvõtmise aeg: 14</span>
        </div>
        <div style={{ flex: 1 }}>
          <h5>Failid</h5>
          <h6>Lähtefailid</h6>
          <div>
            <table>
              <tbody>
                {map(order?.source_files, (file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{file.updated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h6>Abifailid</h6>
          <div>
            <table>
              <tbody>
                {map(order?.help_files, (file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{file.updated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <br />
        {chain(order?.sub_projects)
          .sortBy('ext_id')
          .map((subOrder) => {
            return (
              <div key={subOrder.id}>
                {/* <SubOrderSection id={subOrder.id} /> */}
                <br />
                <br />
                <br />
                <br />
                <br />
              </div>
            )
          })
          .value()}
      </div>
    </div>
  )
}

export default OrderPage
