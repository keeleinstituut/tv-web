import { FC } from 'react'
import { formatDurationMins } from 'helpers/calendar'
import classes from './classes.module.scss'

interface DurationStepperProps {
  durationMinutes: number
  onSetDurationMinutes: (updater: (v: number) => number) => void
}

const DurationStepper: FC<DurationStepperProps> = ({
  durationMinutes,
  onSetDurationMinutes,
}) => (
  <div className={classes.durationStepper}>
    <button
      className={classes.stepperBtn}
      onClick={() => onSetDurationMinutes((v) => Math.max(10, v - 10))}
    >
      −
    </button>
    <span className={classes.stepperValue}>
      {formatDurationMins(durationMinutes)}
    </span>
    <button
      className={classes.stepperBtn}
      onClick={() => onSetDurationMinutes((v) => v + 10)}
    >
      +
    </button>
  </div>
)

export default DurationStepper
