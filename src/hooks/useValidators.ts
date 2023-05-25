import { isArray } from 'lodash'
import { useTranslation } from 'react-i18next'

const emailIsCorrect = (email: string) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  )

const phoneIsCorrect = (phone: string) =>
  /(\+372\s?)?[3-7]([0-9]{6,7})/.test(phone)

const useValidators = () => {
  const { t } = useTranslation()

  // TODO: improve typescript for react-hook-form validate
  // Currently the validator has to work for all input field types
  // instead of just the one we are validating
  const emailValidator = (value?: string | string[]) => {
    if (isArray(value)) return 'error'
    return !value || emailIsCorrect(value) ? true : t('error.invalid_email')
  }

  const phoneValidator = (value?: string | string[]) => {
    if (isArray(value)) return 'error'
    return !value || phoneIsCorrect(value) ? true : t('error.invalid_phone')
  }

  return { emailValidator, phoneValidator }
}

export default useValidators
