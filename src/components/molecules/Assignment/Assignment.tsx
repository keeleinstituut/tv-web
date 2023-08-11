import { FC } from 'react'
import { map } from 'lodash'
import { AssignmentType } from 'types/orders'

interface AssignmentProps {
  index: number
  label?: string
  assignment: AssignmentType
}

const Assignment: FC<AssignmentProps> = ({ index, label, assignment }) => {
  const { candidates, assigned_vendor_id, assignee_id } = assignment
  return (
    <>
      <h3>
        Teostaja {index} ({label})
      </h3>
      <div
        key={assignment.id}
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span style={{ color: 'red' }}>deadline:</span>
          <span style={{ color: 'red' }}>erijuhised tellimuse kohta:</span>
          <span style={{ color: 'red' }}>maht:</span>
          <span style={{ color: 'red' }}>teostaja märkused:</span>
        </div>
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
    </>
  )
}

export default Assignment
