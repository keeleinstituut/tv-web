import { useTranslation } from 'react-i18next'

const emailIsCorrect = (email: string) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  )

const useValidators = () => {
  const { t } = useTranslation()

  const emailValidator = (value?: string) =>
    !value || emailIsCorrect(value) ? true : t('error.invalid_email')

  return { emailValidator }
}

export default useValidators
