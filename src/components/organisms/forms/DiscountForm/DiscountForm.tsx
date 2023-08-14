import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Control } from 'react-hook-form/dist/types'
import {
  DiscountPercentageNames,
  DiscountPercentages,
  Vendor,
} from 'types/vendors'
import useValidators from 'hooks/useValidators'
import { map } from 'lodash'

interface DiscountFormProps {
  vendor: Vendor
  isFormDisabled: boolean
  control: Control<DiscountPercentages, unknown>
  isSubmitting: boolean
  isDirty: boolean
  isValid: boolean
  resetForm: () => void
}

const DiscountForm: FC<DiscountFormProps> = ({ control }) => {
  const { t } = useTranslation()
  const { discountValidator } = useValidators()

  type PercentageRow = {
    label: string
    name: DiscountPercentageNames
  }

  const percentages: PercentageRow[] = [
    { label: '101%', name: DiscountPercentageNames.DP_101 },
    {
      label: t('vendors.repetitions'),
      name: DiscountPercentageNames.DP_repetitions,
    },
    { label: '100%', name: DiscountPercentageNames.DP_100 },
    { label: '95-99%', name: DiscountPercentageNames.DP_95_99 },
    { label: '85-94%', name: DiscountPercentageNames.DP_85_94 },
    { label: '75-84%', name: DiscountPercentageNames.DP_75_84 },
    { label: '50-74%', name: DiscountPercentageNames.DP_50_74 },
    { label: '0-49%', name: DiscountPercentageNames.DP_0_49 },
  ]

  const fields: FieldProps<DiscountPercentages>[] = map(
    percentages,
    ({ label, name }) => ({
      inputType: InputTypes.Text,
      ariaLabel: label,
      placeholder: '20.00%',
      label,
      name,
      className: classes.inputContainer,
      rules: {
        validate: discountValidator,
      },
    })
  )

  return (
    <div className={classes.discountFormContainer}>
      <h2>{t('vendors.analysis_based_discount')}</h2>
      <div className={classes.discountHeader}>
        <div>{t('vendors.match_type')}</div>
        <div>{t('vendors.percent_from_price')}</div>
      </div>
      <DynamicForm fields={fields} control={control} />
    </div>
  )
}

export default DiscountForm
