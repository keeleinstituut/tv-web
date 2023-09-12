import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import { FC } from 'react'
import { Control, useFormState, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from '../Button/Button'
import { size, isEmpty, some } from 'lodash'

import classes from './classes.module.scss'

type ButtonsProps = {
  control: Control<FormValues>
  handleQuit?: () => void
  handleProceed?: () => void
  steps?: {
    label: string
  }[]
  activeStep?: number
  isLoading?: boolean
}

const VendorPriceListButtons: FC<ButtonsProps> = ({
  control,
  handleProceed,
  handleQuit,
  steps,
  activeStep,
  isLoading,
}) => {
  const { t } = useTranslation()
  const isSrcLanguageSelected = !!useWatch({
    control,
    name: 'src_lang_classifier_value_id',
  })

  const destinationLanguages = useWatch({
    control,
    name: 'dst_lang_classifier_value_id',
  })

  const isDstLanguageSelected =
    !!destinationLanguages && !isEmpty(destinationLanguages)

  const skills = useWatch({
    control,
    name: 'skill_id',
  })

  const hasTrueValueSkill = some(skills, (value) => value === true)
  const isSkillSelected = !!skills && hasTrueValueSkill
  const formState = useFormState({ control })
  const isSkillValid = (activeStep === 2 || activeStep === 3) && isSkillSelected

  return (
    <div className={classes.buttonsContainer}>
      <Button appearance={AppearanceTypes.Secondary} onClick={handleQuit}>
        {t('button.quit')}
      </Button>
      <Button
        appearance={AppearanceTypes.Primary}
        disabled={
          !(isSrcLanguageSelected && isDstLanguageSelected) ||
          !isSkillValid ||
          (size(steps) === activeStep && !formState.isValid)
        }
        onClick={handleProceed}
        loading={isLoading}
      >
        {size(steps) === activeStep ? t('button.save') : t('button.proceed')}
      </Button>
    </div>
  )
}

export default VendorPriceListButtons
