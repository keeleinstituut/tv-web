import { FC, useCallback } from 'react'
import useValidators from 'hooks/useValidators'
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ButtonArrow } from 'assets/icons/button_arrow.svg'

type FormValues = {
  email?: string
  terms?: string
  datePicker?: string
  timePicker?: string
  timePickerSeconds?: string
}

const Test: FC = () => {
  const { t } = useTranslation()
  const { emailValidator } = useValidators()

  const { control, handleSubmit } = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onSubmit',
  })
  const testFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.email'),
      label: t('label.email'),
      name: 'email',
      placeholder: t('placeholder.email'),
      type: 'email',
      rules: {
        required: true,
        validate: emailValidator,
      },
    },
    { component: <h2>random</h2> },
    {
      inputType: InputTypes.Checkbox,
      name: 'terms',
      label: 'terms label',
      ariaLabel: 'aria label',
    },
    {
      inputType: InputTypes.Date,
      name: 'datePicker',
      label: 'date picker label',
      ariaLabel: 'date picker aria label',
      placeholder: 'pp.kk.aaaa',
      timePicker: false,
      // disabled: true,
    },
    {
      inputType: InputTypes.Date,
      name: 'timePicker',
      label: 'time picker label',
      ariaLabel: 'time picker aria label',
      timePicker: true,
      showSeconds: false,
    },
    {
      inputType: InputTypes.Date,
      name: 'timePickerSeconds',
      label: 'time picker seconds label',
      ariaLabel: 'time picker seconds aria label',
      timePicker: true,
      showSeconds: true,
    },
  ]

  const onSubmit: SubmitHandler<FormValues> = useCallback((values, e) => {
    console.log('on submit', values, e)
  }, [])

  const onError: SubmitErrorHandler<FormValues> = useCallback(
    (errors, e) => console.log('on error', errors, e),
    []
  )

  return (
    <>
      <div />
      <DynamicForm
        fields={testFields}
        control={control}
        onSubmit={handleSubmit(onSubmit, onError)}
      />
      <Button
        appearance={AppearanceTypes.Primary}
        children="bu"
        size={SizeTypes.M}
        icon={ButtonArrow}
        ariaLabel={t('label.button_arrow')}
        iconPositioning={IconPositioningTypes.Right}
      />
    </>
  )
}

export default Test
