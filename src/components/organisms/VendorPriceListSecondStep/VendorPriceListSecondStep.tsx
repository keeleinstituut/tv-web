import LanguageLabels from 'components/atoms/LanguageLabels/LanguageLabels'
import DynamicForm, {
  FieldProps,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Control, FieldValues } from 'react-hook-form'

type VendorPriceListSecondStepProps<TFormValues extends FieldValues> = {
  skillsFormFields: FieldProps<TFormValues>[]
  control: Control<TFormValues>
  languageOptions?: { label: string; value: string }[]
  customSkillsDynamicFormClass?: string
  srcLanguageValue?: string
  dstLanguageValues?: string[]
}

function VendorPriceListSecondStep<TFormValues extends FieldValues>({
  skillsFormFields,
  control,
  languageOptions,
  customSkillsDynamicFormClass,
  srcLanguageValue,
  dstLanguageValues,
}: VendorPriceListSecondStepProps<TFormValues>) {
  return (
    <>
      <LanguageLabels<TFormValues>
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
