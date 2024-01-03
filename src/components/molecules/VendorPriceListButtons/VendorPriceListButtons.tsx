import {
  Control,
  FieldValues,
  Path,
  useFormState,
  useWatch,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { size, isEmpty, some } from 'lodash'

import classes from './classes.module.scss'

type ButtonsProps<TFormValues extends FieldValues> = {
  control: Control<TFormValues>
  handleQuit?: () => void
  handleProceed?: () => void
  steps?: {
    label: string
  }[]
  activeStep?: number
  languageDirectionKey?: string
  isLoading?: boolean
}

function VendorPriceListButtons<TFormValues extends FieldValues>({
  control,
  handleProceed,
  handleQuit,
  steps,
  activeStep,
  isLoading,
  languageDirectionKey = '',
}: ButtonsProps<TFormValues>) {
  const { t } = useTranslation()

  const formValues = useWatch({
    control,
  })

  const formState = useFormState({ control })

  const isAddingNewLanguagePair = !!formValues.new?.src_lang_classifier_value_id
  const editLanguagePairData = formValues?.[languageDirectionKey]

  const isNewSrcLanguageSelected = !!useWatch({
    control,
    name: 'new.src_lang_classifier_value_id' as Path<TFormValues>,
  })

  const isEditSrcLanguageSelected =
    !!editLanguagePairData?.src_lang_classifier_value_id

  const newDestinationLanguages = useWatch({
    control,
    name: 'new.dst_lang_classifier_value_id' as Path<TFormValues>,
  })

  const editDestinationLanguages =
    editLanguagePairData?.dst_lang_classifier_value_id

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

  const isFormInValid =
    (!formState.isValid || !isEmpty(formState.errors)) &&
    activeStep === size(steps)

  const isNewValueButtonDisabled =
    !isNewLanguageSelected || !isNewSkillValid || isFormInValid
  const isEditValueButtonDisabled =
    !isEditLanguageSelected || !isEditSkillValid || isFormInValid

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
        loading={isLoading}
      >
        {size(steps) === activeStep ? t('button.save') : t('button.proceed')}
      </Button>
    </div>
  )
}

export default VendorPriceListButtons
