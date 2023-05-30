import { AxiosError } from 'axios'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import i18n from 'i18n/i18n'
import { get, compact, map, isEmpty } from 'lodash'
import { keycloak } from 'hooks/useKeycloak'
import { ReactElement } from 'react'

export type ErrorType = AxiosError

const handleError = async (error: ErrorType) => {
  // TODO: this handles the assumed structure of errors from BE
  // Currently not sure what the actual possible structures will be
  console.warn('handling error', error)
  const tempCode = 401
  const { response } = error
  const code = response?.status
  const specificErrors = get(response, 'data.errors', {})
  const mappedErrors = compact(
    map(specificErrors, (value) => get(value, '[0]', null))
  )
  let errorContent: ReactElement | string = ''
  if (typeof error === 'string') {
    errorContent = error
  } else if (!isEmpty(mappedErrors)) {
    errorContent = (
      <>
        {map(mappedErrors, (error, index) => (
          <span key={index}>{error}</span>
        ))}
      </>
    )
  } else {
    errorContent = get(
      response?.data,
      'message',
      i18n.t('error.unknown_error', { code })
    )
  }

  if (tempCode === 401) {
    console.warn('got error 401, so logging out', window.location)
    keycloak.logout({
      redirectUri: `${window.location.href}#show-error`,
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

  throw error
}

export default handleError
