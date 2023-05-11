import { FC, useCallback } from 'react'
import MainLayout from 'components/organisms/MainLayout/MainLayout'
import useValidators from 'hooks/useValidators'
import useKeycloak from 'hooks/useKeycloak'
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
  timePickerRange1?: string
  timePickerRange2?: string
}

const App: FC = () => {
  const { t } = useTranslation()
  const { emailValidator } = useValidators()
  const { keycloak, isUserLoggedIn, userId } = useKeycloak()

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
      dateFormat: 'dd.MM.yyyy',
      timePicker: false,
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
    {
      inputType: InputTypes.Date,
      name: 'timePickerRange1',
      label: 'time range label',
      ariaLabel: 'time picker seconds aria label',
      timePicker: true,
      showSeconds: true,
      range: true,
    },
    {
      inputType: InputTypes.Date,
      name: 'timePickerRange2',
      ariaLabel: 'time picker seconds aria label',
      timePicker: true,
      showSeconds: true,
      range: true,
    },
  ]

  const onSubmit: SubmitHandler<FormValues> = useCallback((values, e) => {
    console.log('on submit', values, e)
  }, [])

  const onError: SubmitErrorHandler<FormValues> = useCallback(
    (errors, e) => console.log('on error', errors, e),
    []
  )

  const testLogin = () => {
    if (keycloak && keycloak.login) {
      keycloak.login()
    }
  }

  return (
    <MainLayout>
      <div />
      <div>
        {userId && isUserLoggedIn ? (
          <pre>{JSON.stringify(userId, null, 2)}</pre>
        ) : (
          <button onClick={testLogin}>{t('button.login')}</button>
        )}
      </div>

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
    </MainLayout>
  )
}

export default App
