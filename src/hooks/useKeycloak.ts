import { useEffect, useState, createContext, useCallback } from 'react'
import {
  pickBy,
  startsWith,
  mapKeys,
  trim,
  camelCase,
  Dictionary,
  size,
  isEmpty,
  includes,
} from 'lodash'
import { setAccessToken, apiClient } from 'api'
import axios from 'axios'
import { endpoints } from 'api/endpoints'
import { InstitutionsDataType } from 'types/institutions'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import Keycloak, { KeycloakConfig, KeycloakTokenParsed } from 'keycloak-js'
import { PrivilegeKey } from 'types/privileges'
import { useNavigate } from 'react-router-dom'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import i18n from 'i18n/i18n'

// TODO: might separate refresh token logic from here

interface UserInfoType extends KeycloakTokenParsed {
  tolkevarav?: {
    selectedInstitution?: {
      id: string
      name: string
    }
    surname?: string
    forename?: string
    privileges?: PrivilegeKey[]
    institutionUserId?: string
  }
}
interface AuthContextType {
  isUserLoggedIn: boolean
  login: () => void
  logout: () => void
  userInfo: UserInfoType
  userPrivileges: PrivilegeKey[]
  institutionUserId: string
}

export const AuthContext = createContext<AuthContextType>({
  isUserLoggedIn: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: () => {},
  userInfo: {},
  userPrivileges: [],
  institutionUserId: '',
})

const keyCloakVariables: Dictionary<string | undefined> = pickBy(
  process.env,
  (_variable: string | number | boolean | undefined, key: string) =>
    startsWith(key, 'REACT_APP_KEYCLOAK')
)

const keyCloakConfig = mapKeys(
  keyCloakVariables,
  (_variable: string | undefined, key: string) =>
    camelCase(trim(key, 'REACT_APP_KEYCLOAK_'))
) as unknown as KeycloakConfig

export const keycloak = new Keycloak(keyCloakConfig)

let refreshInterval: NodeJS.Timer | undefined

const onVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    keycloak.updateToken(Infinity)
  }
}

export const startRefreshingToken = async (
  onFail?: () => void,
  force?: boolean
) => {
  const refreshToken = keycloak.refreshToken
  const tokenExpiry = keycloak.tokenParsed?.exp
  if (!tokenExpiry || !refreshToken) {
    if (onFail) onFail()
    return null
  }
  if (force && refreshToken) {
    await keycloak.updateToken(Infinity)
    return
  }
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = undefined
  }
  const currentDate = new Date()
  const timestampInSeconds = currentDate.getTime() / 1000
  const timeUntilTokenExpires = tokenExpiry - timestampInSeconds

  // Make sure we have time to attempt token refresh automatically twice, in case the first time fails
  // -10 seconds in the end will add some buffer, since we can't count on js to have exact timing
  const interval = timeUntilTokenExpires / 2 - 10
  refreshInterval = setInterval(async () => {
    const done = await keycloak.updateToken(timeUntilTokenExpires)
    if (done) {
      clearInterval(refreshInterval)
    }
  }, interval * 1000)
}

export const selectInstitution = async (institutionId?: string) => {
  // TODO: might need some error handling here as well
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.REACT_APP_KEYCLOAK_client_id || '',
    refresh_token: keycloak.refreshToken || '',
  })
  // select institution for user
  await axios.post(
    `${process.env.REACT_APP_KEYCLOAK_url}/realms/${process.env.REACT_APP_KEYCLOAK_realm}/protocol/openid-connect/token`,
    params,
    {
      headers: {
        'X-Selected-Institution-ID': institutionId,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
      },
    }
  )
  // refresh token, to update state for keycloak
  await keycloak.updateToken(Infinity)
  return true
}

keycloak.onAuthRefreshSuccess = () => {
  // Set new access token + restart refreshing interval
  setAccessToken(keycloak.token)
  startRefreshingToken()
}

const useKeycloak = () => {
  const navigate = useNavigate()
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [userInfo, setUserIdInfo] = useState<UserInfoType>({})
  const [isLoading, setIsLoading] = useState(false)
  const handleLogoutWithError = useCallback(() => {
    // TODO: show global error message
    setIsLoading(false)
    setAccessToken()
    setIsUserLoggedIn(false)
    keycloak.logout()
  }, [])
  // Setting this as a helper function, so we can use it as a callBack for modal
  const finishLogin = useCallback(() => {
    setUserIdInfo(keycloak.idTokenParsed || {})
    setIsUserLoggedIn(true)
    setIsLoading(false)
    // Start refreshing interval
    startRefreshingToken()
    // Token refreshing stops, when window is not visible and doesn't start again
    // Refresh the token again, when window becomes visible
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    const initKeycloak = async () => {
      const isKeycloakUserLoggedIn = await keycloak.init({
        onLoad: 'check-sso',
        // checkLoginIframe: false,
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
      })

      if (!isKeycloakUserLoggedIn) {
        console.warn(
          'logged out with error',
          window.location.hash,
          window.location
        )
        // Currently will show error with any hash
        // If we add any extra hash parameters later, then this should be changed
        if (
          window.location.hash &&
          includes(window.location.hash, 'show-error')
        ) {
          showNotification({
            type: NotificationTypes.Error,
            title: i18n.t('notification.error'),
            content: i18n.t('notification.token_expired_error'),
          })
          navigate(window.location.pathname)
        }
        setIsLoading(false)
        return
      }

      // If used does not have the "tolkevarav" object in their idToken, they are not a user
      // This means that we should not consider them as logged in
      const userAccessObject =
        isKeycloakUserLoggedIn && keycloak.idTokenParsed?.tolkevarav

      if (!userAccessObject || isEmpty(userAccessObject)) {
        handleLogoutWithError()
        return
      }

      setAccessToken(keycloak.token)

      if (userAccessObject?.selectedInstitution) {
        finishLogin()
        return
      }

      // TODO: no need to fetch institutions, if user already has institution selected
      const { data }: InstitutionsDataType = await apiClient.get(
        endpoints.INSTITUTIONS
      )

      if (size(data) === 0) {
        handleLogoutWithError()
        return
      }

      // Check if there is exactly 1 institution to pick
      if (size(data) === 1) {
        // Only 1 available institution
        // Select it automatically for user
        const selectedInstitutionId = data[0].id
        await selectInstitution(selectedInstitutionId)
        finishLogin()
      } else {
        showModal(ModalTypes.InstitutionSelect, {
          institutions: data,
          onClose: handleLogoutWithError,
          onSelect: finishLogin,
        })
      }
    }
    initKeycloak()
    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { keycloak, isUserLoggedIn, userInfo, isLoading }
}

export default useKeycloak
