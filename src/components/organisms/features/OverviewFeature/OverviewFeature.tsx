import { FC } from 'react'
import { map } from 'lodash'
import { SubOrderDetail } from 'types/orders'
import Assignment from 'components/molecules/Assignment/Assignment'

import classes from './classes.module.scss'

// TODO: check later looks pretty much the same as RevisionFeature

type OverviewFeatureProps = Pick<SubOrderDetail, 'assignments'> & {
  catSupported?: boolean
}

const OverviewFeature: FC<OverviewFeatureProps> = ({
  catSupported,
  assignments,
}) => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>feature: OverviewFeature</span>
        <span>catSupported: {String(catSupported)}</span>
      </div>
      <br />
      {map(assignments, (assignment, i) => {
        return (
          <Assignment
            key={assignment.id}
            assignment={assignment}
            index={i + 1}
            label="Ülevaatus"
          />
        )
      })}
    </>
  )
}

export default OverviewFeature
