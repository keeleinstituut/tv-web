import { FC } from 'react'
import { map } from 'lodash'
import { SubOrderDetail } from 'types/orders'
import Assignment from 'components/molecules/Assignment/Assignment'

type FeatureAssignmentsProps = Pick<
  SubOrderDetail,
  | 'assignments'
  | 'source_language_classifier_value_id'
  | 'destination_language_classifier_value_id'
> & {
  hidden?: boolean
}

const FeatureAssignments: FC<FeatureAssignmentsProps> = ({
  assignments,
  hidden,
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
            {...assignment}
            {...rest}
          />
        )
      })}
    </>
  )
}

export default FeatureAssignments
