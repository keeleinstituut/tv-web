import { isArray, isEmpty } from 'lodash'
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

const hasValueOver50Chars = (tagInput: string) => tagInput?.length > 50

const alphanumericCharHyphenSpaceCheck = (tagInput: string) =>
  /^[a-zA-Z0-9 -]+$/.test(tagInput)

const hyphenSpaceAsFirstCharCheck = (tagInput: string) =>
  /^(?![- ])[a-zA-Z0-9 -]+$/.test(tagInput)

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

  const tagInputValidator = (value?: any) => {
    if (!value || hasValueOver50Chars(value)) return t('error.tag_input_length')
    if (!value || !alphanumericCharHyphenSpaceCheck(value))
      return t('error.tag_input_char_error')
    if (!value || !hyphenSpaceAsFirstCharCheck(value))
      return t('error.tag_input_first_char_error')
  }

  return {
    emailValidator,
    phoneValidator,
    picValidator,
    rolesValidator,
    tagInputValidator,
  }
}

export default useValidators
