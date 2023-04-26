import { FC, useCallback } from 'react'
import MainLayout from 'components/organisms/MainLayout/MainLayout'
import { map } from 'lodash'
import useValidators from 'hooks/useValidators'
import useKeycloak from 'hooks/useKeycloak'
import {
  useForm,
  SubmitHandler,
  SubmitErrorHandler,
  useWatch,
} from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'

type FormValues = {
  email?: string
  terms?: string
  datePicker?: string
  timePicker?: string
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
    // {
    //   inputType: InputTypes.Date,
    //   name: 'datePicker',
    //   label: 'date picker label',
    //   ariaLabel: 'date picker aria label',
    //   placeholder: 'pp.kk.aaaa',
    //   dateFormat: 'dd.MM.yyyy',
    // },
    {
      inputType: InputTypes.Date,
      name: 'timePicker',
      label: 'time picker label',
      ariaLabel: 'time picker aria label',
      // placeholder: 'pp.kk.aaaa',
      dateFormat: 'dd.MM.yyyy',
      timePicker: true,
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

  const formValue = useWatch({ control })

  console.log('FORM VALUE: ', formValue)

  return (
    <MainLayout>
      <div />
      <div>
        {userId && isUserLoggedIn ? (
          map(userId, (value: string, key: string) => (
            <h6>
              {key}: {value}
            </h6>
          ))
        ) : (
          <button onClick={testLogin}>{t('button.login')}</button>
        )}
      </div>

      <DynamicForm
        fields={testFields}
        control={control}
        onSubmit={handleSubmit(onSubmit, onError)}
      />
    </MainLayout>
  )
}

export default App
