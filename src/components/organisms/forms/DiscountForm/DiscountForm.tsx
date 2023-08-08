import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import FormButtons from 'components/organisms/FormButtons/FormButtons'
import classes from './classes.module.scss'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Control } from 'react-hook-form/dist/types'
import { Vendor } from 'types/vendors'

interface DiscountFormProps {
  vendor: Vendor
  isFormDisabled: boolean
  control: Control<FormValues, any>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
  resetForm: () => void
}

interface FormValues {
  discount_percentage_0_49?: string
  discount_percentage_50_74?: string
  discount_percentage_75_84?: string
  discount_percentage_85_94?: string
  discount_percentage_95_99?: string
  discount_percentage_100?: string
  discount_percentage_101?: string
  discount_percentage_repetitions?: string
}

const DiscountFrom: FC<DiscountFormProps> = ({
  vendor,
  isFormDisabled,
  control,
  isSubmitting,
  isDirty,
  isValid,
  resetForm,
}) => {
  const { t } = useTranslation()

  const precentages: string[] = [
    '101%',
    t('vendors.repetitions'),
    '95-99%',
    '85-94%',
    '75-84%',
    '50-74%',
    '0-49%',
  ]

  const fields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: '101%',
      placeholder: '20.00%',
      label: '101%',
      name: 'discount_percentage_101',
      className: classes.inputContainer,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('vendors.repetitions'),
      placeholder: '20.00%',
      label: t('vendors.repetitions'),
      name: 'discount_percentage_repetitions',
      className: classes.inputContainer,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('vendors.repetitions'),
      placeholder: '20.00%',
      label: '100%',
      name: 'discount_percentage_100',
      className: classes.inputContainer,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('vendors.repetitions'),
      placeholder: '20.00%',
      label: '100%',
      name: 'discount_percentage_100',
      className: classes.inputContainer,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('vendors.repetitions'),
      placeholder: '20.00%',
      label: '100%',
      name: 'discount_percentage_100',
      className: classes.inputContainer,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('vendors.repetitions'),
      placeholder: '20.00%',
      label: '100%',
      name: 'discount_percentage_100',
      className: classes.inputContainer,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('vendors.repetitions'),
      placeholder: '20.00%',
      label: '100%',
      name: 'discount_percentage_100',
      className: classes.inputContainer,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('vendors.repetitions'),
      placeholder: '20.00%',
      label: '100%',
      name: 'discount_percentage_100',
      className: classes.inputContainer,
      rules: {
        required: true,
      },
    },
  ]

  return (
    <div className={classes.discountFormContainer}>
      <h2>{t('vendors.analysis_based_discount')}</h2>
      <div className={classes.discountHeader}>
        <div>{t('vendors.match_type')}</div>
        <div>{t('vendors.percent_from_price')}</div>
      </div>
      <DynamicForm
        fields={fields}
        control={control}
        onSubmit={() => {
          console.log('submit')
        }}
      >
        <FormButtons
          isResetDisabled={!isDirty}
          isSubmitDisabled={!isDirty || !isValid}
          loading={isSubmitting}
          resetForm={resetForm}
          hidden={isFormDisabled}
          className={classes.formButtons}
        />
      </DynamicForm>
    </div>
  )
}

export default DiscountFrom
