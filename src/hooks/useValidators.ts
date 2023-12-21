import { isArray, isEmpty, isObject, size } from 'lodash'
import { useTranslation } from 'react-i18next'

const emailIsCorrect = (email: string) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  )

const phoneIsCorrect = (phone: string) =>
  /(\+372\s?)[3-7]([0-9]{6,7})$/.test(phone)

const picIsCorrect = (pic: string) =>
  /^(?:3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9])[0-9](?:0[1-9]|1[0-2])(?:0[1-9]|[12][0-9]|3[01])\d{4}$/.test(
    pic
  )

const hasValueOver50Chars = (tagInput: string) => tagInput?.length > 50
const hasValueOver100Chars = (tagInput: string) => tagInput?.length > 100

const alphanumericCharHyphenSpaceCheck = (tagInput: string) =>
  /^[a-zA-Z0-9ŠšŽžÕõÄäÖöÜü -]+$/.test(tagInput)

const hyphenSpaceAsFirstCharCheck = (tagInput: string) =>
  /^(?![- ])[a-zA-Z0-9ŠšŽžÕõÄäÖöÜü -]+$/.test(tagInput)

const alphaCharCheck = (tagInput: string) =>
  /^(?![- ])[a-zA-Z -]*$/.test(tagInput)

const numberBetweenZeroAndHundred = (number: string) =>
  /^(100(\.0+)?|\d{1,2}(\.\d+)?)$/.test(number)

const allowAllNumbersWithDot = (number: string) =>
  /^(\d+(\.\d+)?|\.\d+)$/.test(number)

const useValidators = () => {
  const { t } = useTranslation()

  // TODO: improve typescript for react-hook-form validate
  // Currently the validator has to work for all input field types
  // instead of just the one we are validating
  const emailValidator = (value?: string | string[] | null | object) => {
    if (isArray(value) || isObject(value)) return 'error'
    return !value || emailIsCorrect(value) ? true : t('error.invalid_email')
  }

  const phoneValidator = (value?: string | string[] | null | object) => {
    if (isArray(value) || isObject(value)) return 'error'
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

  const tagInputValidator = (value?: string) => {
    if (!value || hasValueOver50Chars(value)) {
      return t('error.tag_input_length')
    }
    if (!alphanumericCharHyphenSpaceCheck(value)) {
      return t('error.tag_input_char_error')
    }
    if (!hyphenSpaceAsFirstCharCheck(value)) {
      return t('error.tag_input_first_char_error')
    }
    return true
  }
  const nameInputValidator = (value?: string | null) => {
    if (!value || hasValueOver100Chars(value)) {
      return t('error.name_input_length')
    }
    if (!alphaCharCheck(value)) {
      return t('error.name_input_char_error')
    }
    return true
  }

  const discountValidator = (value?: string | null) => {
    if (value && !numberBetweenZeroAndHundred(value)) {
      return t('error.discount_number')
    }

    return true
  }

  const priceValidator = (value?: string | null) => {
    if (value && !allowAllNumbersWithDot(value)) {
      return t('error.invalid_price')
    }

    return true
  }
  const minLengthValidator = (value?: string | string[] | null | object) => {
    if (!!value && size(value) < 3) {
      return t('error.search_input_length')
    }
  }

  type valueType = {
    days?: string[]
    time_range?: { start?: string; end?: string }
  } | null

  const dateTimeValidator = (value?: valueType) => {
    if (
      !value?.days ||
      !value?.time_range ||
      !value?.time_range?.start ||
      !value?.time_range?.end
    ) {
      return t('error.required')
    }
    return true
  }

  return {
    emailValidator,
    phoneValidator,
    picValidator,
    rolesValidator,
    tagInputValidator,
    discountValidator,
    dateTimeValidator,
    priceValidator,
    nameInputValidator,
    minLengthValidator,
  }
}

export default useValidators
