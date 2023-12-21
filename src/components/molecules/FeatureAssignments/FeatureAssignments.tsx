import { FC } from 'react'
import { map } from 'lodash'
import { SubProjectDetail } from 'types/projects'
import Assignment from 'components/molecules/Assignment/Assignment'

type FeatureAssignmentsProps = Pick<SubProjectDetail, 'assignments'> & {
  hidden?: boolean
  catSupported?: boolean
  isEditable?: boolean
}

const FeatureAssignments: FC<FeatureAssignmentsProps> = ({
  assignments,
  hidden,
  isEditable,
  catSupported,
}) => {
  if (hidden) return null
  return (
    <>
      {map(assignments, (assignment, index) => {
        return (
          <Assignment
            key={assignment.id}
            index={index}
            {...assignment}
            isEditable={isEditable}
            catSupported={catSupported}
          />
        )
      })}
    </>
  )
}

export default FeatureAssignments
