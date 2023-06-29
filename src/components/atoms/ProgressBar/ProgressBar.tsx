import { FC } from 'react'
import classes from './styles.module.scss'
import classNames from 'classnames'

export type Step = {
  label: string
  isCurrentStep: boolean
}

interface ProgressBarProps {
  steps: Step[]
}

const ProgressBar: FC<ProgressBarProps> = ({ steps }) => {
  return (
    <div className={classes.progressBarContainer}>
      <ul className={classes.steps}>
        {steps.map((step, index) => {
          const { label, isCurrentStep } = step || {}

          return (
            <li
              key={index}
              className={classNames(classes.step, {
                [classes.currentStep]: isCurrentStep,
              })}
            >
              <p className={classes.stepNumber}>{index + 1}</p>
              <p className={classes.stepLabel}>{label}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ProgressBar
