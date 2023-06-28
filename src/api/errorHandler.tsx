import { AxiosError } from 'axios'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import i18n from 'i18n/i18n'
import { get, compact, map, isEmpty } from 'lodash'
import { keycloak, startRefreshingToken } from 'hooks/useKeycloak'
import { ReactElement } from 'react'

interface ValidationErrorDataType {
  [key: string]: string[]
}

interface RowValidationErrorType {
  row: number
  errors: ValidationErrorDataType
}
export interface ValidationError extends Error {
  errors: ValidationErrorDataType
}

export interface CsvValidationError extends Error {
  errors: RowValidationErrorType[]
}

const handleError = async (error?: AxiosError) => {
  // TODO: needs some improvements + better handling of 403 errors
  const { response } = error || {}
  const code = response?.status
  const specificErrors = get(response, 'data.errors', {})
  const genericErrorMessage = get(response, 'data.message', '')
  const mappedErrors = compact(
    map(specificErrors, (value) => get(value, '[0]', null))
  )
  let errorContent: ReactElement | string = ''
  if (typeof error === 'string') {
    errorContent = error
  } else if (genericErrorMessage) {
    errorContent = genericErrorMessage
  } else if (!isEmpty(mappedErrors)) {
    // Normally these are field specific errors
    // Currently we are assuming that there will be some generic error message together with these
    errorContent = (
      <>
        {map(mappedErrors, (error, index) => (
          <span key={index}>{error}</span>
        ))}
      </>
    )
  } else {
    // unknown error
    errorContent = i18n.t('error.unknown_error', { code })
  }

  if (code === 401) {
    // Attemp token refresh, log out if it fails
    startRefreshingToken(() => {
      keycloak.logout({
        redirectUri: `${window.location.href}#show-error`,
      })
    })
  }

  showNotification({
    type: NotificationTypes.Error,
    title: i18n.t('notification.error'),
    content: errorContent,
  })

  if (code === 403) {
    // TODO: might do sth here, although if we get error message from BE, then there is no need to
  }

  if (code === 422) {
    // Throw only validation errors
    throw error?.response?.data
  } else {
    // In all other cases we will throw the error as well for more fine-grained handling in some cases
    throw error
  }
}

export default handleError
