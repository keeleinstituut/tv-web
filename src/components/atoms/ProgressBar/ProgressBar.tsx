import { FC } from 'react'
import classes from './classes.module.scss'
import classNames from 'classnames'
import { map } from 'lodash'

export interface Step {
  label: string
}

interface ProgressBarProps {
  steps: Step[]
  activeStep: number
  setActiveStep: (index: number) => void
}

const ProgressBar: FC<ProgressBarProps> = ({
  steps,
  activeStep,
  setActiveStep,
}) => {
  return (
    <ul className={classes.progressBarSteps}>
      {map(steps, (step, index) => {
        const { label } = step || {}

        return (
          <li
            key={index}
            className={classNames(classes.step, {
              [classes.currentStep]: activeStep === index + 1,
            })}
            onClick={() => setActiveStep(index + 1)}
          >
            <span className={classes.stepNumber}>{index + 1}</span>
            <span className={classes.stepLabel}>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default ProgressBar
