import { FC, useCallback } from 'react'
import useValidators from 'hooks/useValidators'
import useKeycloak from 'hooks/useKeycloak'
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
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ButtonArrowWhite } from 'assets/icons/button_arrow_white.svg'

const Test: FC = () => {
  const { t } = useTranslation()
  const { emailValidator } = useValidators()
  const { keycloak, isUserLoggedIn, userId } = useKeycloak()

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

  const testLogin = () => {
    if (keycloak && keycloak.login) {
      keycloak.login()
    }
  }
  return (
    <>
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
        icon={ButtonArrowWhite}
        ariaLabel={t('label.button_arrow')}
        iconPositioning={IconPositioningTypes.Right}
      />
    </>
  )
}

export default Test
