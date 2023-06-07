import { isArray, isEmpty, split, size, compact } from 'lodash'
import { useTranslation } from 'react-i18next'

const emailIsCorrect = (email: string) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  )

const phoneIsCorrect = (phone: string) =>
  /(\+372\s?)[3-7]([0-9]{6,7})/.test(phone)

const picIsCorrect = (pic: string) =>
  /^(?:3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9])[0-9](?:0[1-9]|1[0-2])(?:0[1-9]|[12][0-9]|3[01])\d{4}$/.test(
    pic
  )

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

  const picValidator = (value?: string | string[]) => {
    if (isArray(value)) return 'error'
    return !value || picIsCorrect(value) ? true : t('error.invalid_pic')
  }

  const rolesValidator = (value?: string[]) => {
    if (!value || isEmpty(value)) return t('error.role_required')
    return true
  }

  const nameValidator = (value?: string) => {
    if (value && size(compact(split(value, ' '))) > 1) return true
    return t('error.invalid_username')
  }

  return {
    emailValidator,
    phoneValidator,
    picValidator,
    rolesValidator,
    nameValidator,
  }
}

export default useValidators
