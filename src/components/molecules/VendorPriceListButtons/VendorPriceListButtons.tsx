import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import { FC } from 'react'
import { Control, useFormState, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
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
  languageDirectionKey?: string
}

const VendorPriceListButtons: FC<ButtonsProps> = ({
  control,
  handleProceed,
  handleQuit,
  steps,
  activeStep,
  languageDirectionKey = '',
}) => {
  const { t } = useTranslation()
  const { isSubmitting } = useFormState({ control })

  const formValues = useWatch({
    control,
  })

  const isAddingNewLanguagePair = !!formValues.new?.src_lang_classifier_value_id
  const editLanguagePairData = formValues?.[languageDirectionKey]

  const isNewSrcLanguageSelected = !!useWatch({
    control,
    name: 'new.src_lang_classifier_value_id.id',
  })

  const isEditSrcLanguageSelected =
    !!editLanguagePairData?.src_lang_classifier_value_id?.id

  const newDestinationLanguages = useWatch({
    control,
    name: 'new.dst_lang_classifier_value_id.id',
  })

  const editDestinationLanguages =
    editLanguagePairData?.dst_lang_classifier_value_id?.id

  const isNewDstLanguageSelected =
    !!newDestinationLanguages && !isEmpty(newDestinationLanguages)

  const isEditDstLanguageSelected =
    !!editDestinationLanguages && !isEmpty(editDestinationLanguages)

  const newSkills =
    useWatch({
      control,
    }).new?.priceObject || []

  const editSkills = editLanguagePairData?.priceObject || []
  const newSkillsValues = (newSkills as { isSelected?: boolean }[]) || []
  const editSkillsValues = (editSkills as { isSelected?: boolean }[]) || []
  const hasTrueNewValueSkill = some(newSkillsValues, 'isSelected')
  const hasTrueEditValueSkill = some(editSkillsValues, 'isSelected')

  const isNewLanguageSelected =
    isNewSrcLanguageSelected && isNewDstLanguageSelected

  const isEditLanguageSelected =
    isEditSrcLanguageSelected && isEditDstLanguageSelected

  const isNewSkillValid =
    activeStep === 2 || activeStep === 3 ? hasTrueNewValueSkill : true

  const isEditSkillValid =
    activeStep === 2 || activeStep === 3 ? hasTrueEditValueSkill : true

  const isNewValueButtonDisabled = !(isNewLanguageSelected && isNewSkillValid)
  const isEditValueButtonDisabled = !(
    isEditLanguageSelected && isEditSkillValid
  )

  const isButtonDisabled = isAddingNewLanguagePair
    ? isNewValueButtonDisabled
    : isEditValueButtonDisabled

  return (
    <div className={classes.buttonsContainer}>
      <Button appearance={AppearanceTypes.Secondary} onClick={handleQuit}>
        {t('button.quit')}
      </Button>
      <Button
        appearance={AppearanceTypes.Primary}
        disabled={isButtonDisabled}
        onClick={handleProceed}
        loading={isSubmitting}
      >
        {size(steps) === activeStep ? t('button.save') : t('button.proceed')}
      </Button>
    </div>
  )
}

export default VendorPriceListButtons
