import { FC } from 'react'
import LanguageLabels from 'components/atoms/LanguageLabels/LanguageLabels'
import DynamicForm, {
  FieldProps,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Control } from 'react-hook-form'
import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'

type VendorPriceListSecondStepProps = {
  skillsFormFields: FieldProps<FormValues>[]
  control: Control<FormValues>
  languageOptions?: { label: string; value: string }[]
  customSkillsDynamicFormClass?: string
  srcLanguageValue?: string
  dstLanguageValues?: string[]
}

const VendorPriceListSecondStep: FC<VendorPriceListSecondStepProps> = ({
  skillsFormFields,
  control,
  languageOptions,
  customSkillsDynamicFormClass,
  srcLanguageValue,
  dstLanguageValues,
}) => {
  return (
    <>
      <LanguageLabels
        control={control}
        languageOptions={languageOptions}
        srcLanguageValue={srcLanguageValue}
        dstLanguageValues={dstLanguageValues}
      />
      <DynamicForm
        fields={skillsFormFields}
        control={control}
        className={customSkillsDynamicFormClass}
      />
    </>
  )
}

export default VendorPriceListSecondStep
