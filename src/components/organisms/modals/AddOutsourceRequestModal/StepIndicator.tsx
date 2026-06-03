import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'

import classes from './classes.module.scss'
import { WizardStep } from './types'

interface StepIndicatorProps {
  current: WizardStep
}

const StepIndicator: FC<StepIndicatorProps> = ({ current }) => {
  const { t } = useTranslation()

  const steps: Array<{ step: WizardStep; label: string }> = [
    { step: WizardStep.VendorSelection, label: t('requests.wizard_step_1') },
    {
      step: WizardStep.RequestConditions,
      label: t('requests.wizard_step_2'),
    },
    { step: WizardStep.RelatedFiles, label: t('requests.wizard_step_3') },
    { step: WizardStep.PriceAndVolume, label: t('requests.wizard_step_4') },
  ]

  return (
    <div className={classes.stepIndicator}>
      {steps.map(({ step, label }) => {
        const isActive = step === current
        return (
          <div
            key={step}
            className={classNames(classes.step, isActive && classes.stepActive)}
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
