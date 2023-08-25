import { FC } from 'react'
import classNames from 'classnames'
import { map } from 'lodash'
import classes from './classes.module.scss'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'

export interface WorkingAndVacationTime {
  dateString: string
  isVacation: boolean
}

interface WorkingAndVacationTimesBarsProps {
  times: WorkingAndVacationTime[]
  className?: string
}

const WorkingAndVacationTimesBars: FC<WorkingAndVacationTimesBarsProps> = ({
  times,
  className,
}) => (
  <div className={classNames(classes.container, className)}>
    {map(times, ({ dateString, isVacation }) => (
      <SmallTooltip
        tooltipContent={dateString}
        hideIcon
        className={classNames(classes.bar, isVacation && classes.vacation)}
      />
    ))}
  </div>
)

export default WorkingAndVacationTimesBars
