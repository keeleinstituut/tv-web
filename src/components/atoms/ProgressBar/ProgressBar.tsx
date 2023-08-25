import { FC } from 'react'
import classes from './classes.module.scss'
import classNames from 'classnames'

export interface Step {
  label: string
}

interface ProgressBarProps {
  steps: Step[]
  activeStep: number
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const ProgressBar: FC<ProgressBarProps> = ({
  steps,
  activeStep,
  setActiveStep,
}) => {
  const handleStepClick = (index: number) => {
    setActiveStep(index)
  }

  return (
    <ul className={classes.progressBarSteps}>
      {steps.map((step, index) => {
        const { label } = step || {}

        return (
          <li
            key={index}
            className={classNames(classes.step, {
              [classes.currentStep]: activeStep === index + 1,
            })}
            onClick={() => handleStepClick(index + 1)}
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
