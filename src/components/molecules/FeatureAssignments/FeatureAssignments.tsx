import { FC } from 'react'
import { map } from 'lodash'
import { SubProjectDetail } from 'types/projects'
import Assignment from 'components/molecules/Assignment/Assignment'
import { VolumeValue } from 'types/volumes'

type FeatureAssignmentsProps = Pick<
  SubProjectDetail,
  | 'assignments'
  | 'source_language_classifier_value_id'
  | 'destination_language_classifier_value_id'
  | 'cat_analyzis'
  | 'project'
  | 'deadline_at'
> & {
  hidden?: boolean
  catSupported?: boolean
  volumes?: VolumeValue[]
}

const FeatureAssignments: FC<FeatureAssignmentsProps> = ({
  assignments,
  hidden,
  deadline_at,
  ...rest
}) => {
  if (hidden) return null
  return (
    <>
      {map(assignments, (assignment, index) => {
        return (
          <Assignment
            key={assignment.id}
            index={index}
            subProjectDeadline={deadline_at}
            {...rest}
            {...assignment}
          />
        )
      })}
    </>
  )
}

export default FeatureAssignments
