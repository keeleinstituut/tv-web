import { FC, useEffect, useState, useCallback } from 'react'
import MainLayout from 'components/organisms/MainLayout/MainLayout'
import Keycloak from 'keycloak-js'
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

const keycloak = new Keycloak()

const App: FC = () => {
  const { t } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string>('')

  const { control, handleSubmit } = useForm<FieldValues>({
    mode: 'onChange',
    reValidateMode: 'onSubmit',
  })
  const testFields: FieldProps[] = [
    {
      inputType: InputTypes.Text,
      label: <div />,
      ariaLabel: 'ranodm',
      name: 'email',
      placeholder: t('placeholder.email'),
      type: 'email',
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
    </MainLayout>
  )
}

export default App
