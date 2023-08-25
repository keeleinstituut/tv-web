import { FC } from 'react'
import { map } from 'lodash'
import { AssignmentType } from 'types/orders'
import Assignment from 'components/molecules/Assignment/Assignment'

interface FeatureAssignmentsProps {
  assignments: AssignmentType[]
  hidden?: boolean
}

const FeatureAssignments: FC<FeatureAssignmentsProps> = ({
  assignments,
  hidden,
}) => {
  if (hidden) return null
  return (
    <>
      {map(assignments, (assignment, index) => {
        return <Assignment key={assignment.id} index={index} {...assignment} />
      })}
    </>
  )
}

export default FeatureAssignments
