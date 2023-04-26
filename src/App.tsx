import { FC, useEffect, useState, useCallback } from 'react'
import MainLayout from 'components/organisms/MainLayout/MainLayout'
import Keycloak from 'keycloak-js'
import useValidators from 'hooks/useValidators'
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'

type FormValues = {
  email?: string
  terms?: string
  datePicker?: string
}

const keycloak = new Keycloak()

const App: FC = () => {
  const { t } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string>('')
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
      dateFormat: 'dd.MM.yyyy',
    },
  ]

  const onSubmit: SubmitHandler<FormValues> = useCallback((values, e) => {
    console.log('on submit', values, e)
  }, [])

  const onError: SubmitErrorHandler<FormValues> = useCallback(
    (errors, e) => console.log('on error', errors, e),
    []
  )

  useEffect(() => {
    const checkIfUserLoggedIn = async () => {
      const isUserLoggedIn = await keycloak.init({})
      if (isUserLoggedIn) {
        setIsAuthenticated(true)
        setUserId(keycloak?.idTokenParsed?.aud || '')
      } else {
        setIsAuthenticated(false)
      }
    }
    checkIfUserLoggedIn()
  }, [])

  const testLogin = () => keycloak && keycloak.login()

  return (
    <MainLayout>
      <div />
      {userId && isAuthenticated ? (
        <h1>{userId}</h1>
      ) : (
        <button onClick={testLogin}>{t('button.login')}</button>
      )}
      <DynamicForm<FormValues>
        fields={testFields}
        control={control}
        onSubmit={handleSubmit(onSubmit, onError)}
      />
    </MainLayout>
  )
}

export default App
