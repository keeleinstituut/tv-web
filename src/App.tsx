import { FC, useEffect, useState, useCallback } from 'react'
import MainLayout from 'components/organisms/MainLayout/MainLayout'
import Keycloak from 'keycloak-js'
import useValidators from 'hooks/useValidators'
import {
  useForm,
  FieldValues,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import DatePicker from 'components/molecules/DatePickerInput/DatePickerInput'

const keycloak = new Keycloak()

const App: FC = () => {
  const { t } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [userId, setUserId] = useState<string>('')
  const { emailValidator } = useValidators()

  const { control, handleSubmit } = useForm<FieldValues>({
    mode: 'onChange',
    reValidateMode: 'onSubmit',
  })
  const testFields: FieldProps[] = [
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
  ]

  const onSubmit: SubmitHandler<FieldValues> = useCallback((values, e) => {
    console.log('on submit', values, e)
  }, [])

  const onError: SubmitErrorHandler<FieldValues> = useCallback(
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
      <DynamicForm
        fields={testFields}
        control={control}
        onSubmit={handleSubmit(onSubmit, onError)}
      />
      <DatePicker
        value={selectedDate}
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        name={'Date picker'}
        label={'Label'}
        placeholder={'dd.MM.yyyy'}
        disabled
        onBlur={function (): void {
          throw new Error('Function not implemented.')
        }}
        // message="error"
      />
    </MainLayout>
  )
}

export default App
