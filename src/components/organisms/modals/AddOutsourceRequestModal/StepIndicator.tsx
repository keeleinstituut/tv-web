import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'

import classes from './classes.module.scss'
import { WizardStep } from './types'

interface StepIndicatorProps {
  current: WizardStep
  maxStep: WizardStep
  onStepClick?: (step: WizardStep) => void
}

const StepIndicator: FC<StepIndicatorProps> = ({ current, maxStep, onStepClick }) => {
  const { t } = useTranslation()

  const steps: Array<{ step: WizardStep; label: string }> = [
    { step: WizardStep.VendorSelection, label: t('requests.wizard_step_1') },
    {
      step: WizardStep.RequestConditions,
      label: t('requests.wizard_step_2'),
    },
    { step: WizardStep.RelatedFiles, label: t('requests.wizard_step_3') },
    { step: WizardStep.PriceAndVolume, label: t('requests.wizard_step_4') },
    { step: WizardStep.Summary, label: t('requests.wizard_step_5') },
  ]

  return (
    <div className={classes.stepIndicator}>
      {steps.map(({ step, label }) => {
        const isActive = step === current
        const isCompleted = step !== current && step <= maxStep
        return (
          <div
            key={step}
            className={classNames(
              classes.step,
              isActive && classes.stepActive,
              isCompleted && classes.stepCompleted,
            )}
            onClick={
              isCompleted && onStepClick ? () => onStepClick(step) : undefined
            }
          >
            <span className={classes.stepNumber}>{step}</span>
            <span className={classes.stepLabel}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator
