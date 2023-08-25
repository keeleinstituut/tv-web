import { FC, useCallback } from 'react'
import { map } from 'lodash'
import { AssignmentType } from 'types/orders'
import { useTranslation } from 'react-i18next'
import Button, { SizeTypes } from 'components/molecules/Button/Button'

import classes from './classes.module.scss'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'

interface AssignmentProps extends AssignmentType {
  index: number
}

// {
//   /* feature: SubProjectFeatures
//   // id: string
//   // candidates: Candidate[]
//   // assigned_vendor_id?: string
//   // assignee_id?: string */
// }

const Assignment: FC<AssignmentProps> = ({
  index,
  candidates,
  id,
  assigned_vendor_id,
  assignee_id,
  feature,
}) => {
  const { t } = useTranslation()
  const selectedVendorsIds = map(candidates, 'vendor_id')
  const handleOpenVendorsModal = useCallback(() => {
    showModal(ModalTypes.SelectVendor, {
      taskId: id,
      selectedVendorsIds,
    })
  }, [selectedVendorsIds, id])

  return (
    <div className={classes.assignmentContainer}>
      <div>
        <h3>
          {t('task.vendor_title', { number: index + 1 })}(
          {t(`orders.features.${feature}`)})
        </h3>
        <span className={classes.assignmentId}>{id}</span>
        <Button
          size={SizeTypes.S}
          className={classes.addButton}
          onClick={handleOpenVendorsModal}
        >
          {t('button.choose_from_database')}
        </Button>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span style={{ color: 'red' }}>deadline:</span>
          <span style={{ color: 'red' }}>erijuhised tellimuse kohta:</span>
          <span style={{ color: 'red' }}>maht:</span>
          <span style={{ color: 'red' }}>teostaja märkused:</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h1>Teostajad</h1>
          <table>
            <thead>
              <tr>
                <th>Nimi</th>
                <th>Staatus</th>
                <th style={{ color: 'red' }}>Maksumus</th>
              </tr>
            </thead>
            <tbody>
              {map(candidates, (candidate) => {
                const { institution_user } = candidate.vendor
                const name = `${institution_user.user.forename} ${institution_user.user.surname}`
                let status = '-'
                console.log(
                  '--------------------------------------------------------------------'
                )
                console.log(assigned_vendor_id)
                console.log(candidate.vendor_id)
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                if (!assignee_id) {
                  status = 'Teostajale edastatud'
                }
                if (assigned_vendor_id == candidate.vendor_id) {
                  status = 'Teostamisel'
                } else {
                  status = 'Mitte valitud'
                }
                return (
                  <tr key={candidate.id}>
                    <td>{name}</td>
                    <td>{status}</td>
                    <td>{candidate.price}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {/* {(!assignment.somethingsomething || true) && (
            <Button
              onClick={() => {
                // Do nothing
              }}
            >
              Saada pakkumus
            </Button>
          )} */}
          {/* {!subOrder.cat_project_created && (
            <Button onClick={() => {}}>genereeri tõlkimiseks</Button>
          )} */}
        </div>
      </div>
    </div>
  )
}

export default Assignment
