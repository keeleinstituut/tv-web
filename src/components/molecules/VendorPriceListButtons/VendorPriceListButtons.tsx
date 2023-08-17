import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import { FC } from 'react'
import { Control, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from '../Button/Button'
import { size } from 'lodash'

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
  const isDstLanguageSelected = !!useWatch({
    control,
    name: 'dst_lang_classifier_value_id',
  })
  const isSkillSelected = !!useWatch({
    control,
    name: 'skill_id',
  })

  return (
    <div className={classes.buttonsContainer}>
      <Button appearance={AppearanceTypes.Secondary} onClick={handleQuit}>
        {t('button.quit')}
      </Button>
      <Button
        appearance={AppearanceTypes.Primary}
        disabled={
          !(isSrcLanguageSelected && isDstLanguageSelected) ||
          (activeStep === 2 && !isSkillSelected)
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
