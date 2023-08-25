import { FC } from 'react'
import { map } from 'lodash'
import { SubOrderDetail } from 'types/orders'
import Assignment from 'components/molecules/Assignment/Assignment'

import classes from './classes.module.scss'
import FeatureHeaderSection from 'components/organisms/FeatureHeaderSection/FeatureHeaderSection'

// TODO: check later looks pretty much the same as OverviewFeature
// TODO: this is WIP code for suborder view

type RevisionFeatureProps = Pick<SubOrderDetail, 'assignments'> & {
  catSupported?: boolean
  index?: number
}

const RevisionFeature: FC<RevisionFeatureProps> = ({
  catSupported,
  assignments,
  index,
}) => {
  return (
    <>
      <FeatureHeaderSection
        {...{
          catSupported,
          addVendor:
            index === 1
              ? undefined
              : () => {
                  // DO stuff
                },
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>feature: RevisionFeature</span>
        <span>catSupported: {String(catSupported)}</span>
      </div>
      <br />
      {/* {map(assignments, (assignment, i) => {
        return (
          <Assignment
            key={assignment.id}
            assignment={assignment}
            index={i + 1}
            label="Toimetamine"
          />
        )
      })} */}
    </>
  )
}

export default RevisionFeature
