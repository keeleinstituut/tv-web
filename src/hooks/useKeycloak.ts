import { useEffect, useState, createContext, useCallback } from 'react'
import {
  pickBy,
  startsWith,
  mapKeys,
  trim,
  camelCase,
  Dictionary,
  size,
} from 'lodash'
import { setAccessToken, apiClient } from 'api'
import axios from 'axios'
import { endpoints } from 'api/endpoints'
import { InstitutionType } from 'types/institutions'
import { showModal, ModalTypes } from 'components/organisms/modals'
import Keycloak, { KeycloakConfig, KeycloakTokenParsed } from 'keycloak-js'

// TODO: might separate refresh token logic from here

interface UserInfoType extends KeycloakTokenParsed {
  tolkevarav?: {
    selectedInstitution?: {
      id: string
      name: string
    }
    privileges?: string[]
  }
}
interface AuthContextType {
  isUserLoggedIn: boolean
  login: () => void
  logout: () => void
  userInfo: UserInfoType
  userPrivileges: string[]
}

export const AuthContext = createContext<AuthContextType>({
  isUserLoggedIn: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: () => {},
  userInfo: {},
  userPrivileges: [],
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
const keycloak = new Keycloak(keyCloakConfig)

let refreshInterval: NodeJS.Timer | undefined

const onVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    keycloak.updateToken(Infinity)
  }
}

const startRefreshingToken = () => {
  const refreshToken = keycloak.refreshToken
  const tokenExpiry = keycloak.tokenParsed?.exp
  if (!tokenExpiry || !refreshToken) {
    return null
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

const useKeycloak = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [userInfo, setUserIdInfo] = useState<UserInfoType>({})
  const handleLogoutWithError = useCallback(() => {
    // TODO: show global error message
    setAccessToken()
    setIsUserLoggedIn(false)
    keycloak.logout()
  }, [])
  // Setting this as a helper function, so we can use it as a callBack for modal
  const finishLogin = useCallback(() => {
    setUserIdInfo(keycloak.idTokenParsed || {})
    setIsUserLoggedIn(true)
    // Start refreshing interval
    startRefreshingToken()
    // Token refreshing stops, when window is not visible and doesn't start again
    // Refresh the token again, when window becomes visible
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const initKeycloak = async () => {
      const isKeycloakUserLoggedIn = await keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
      })

      if (!isKeycloakUserLoggedIn) {
        return
      }

      // If used does not have the "tolkevarav" object in their idToken, they are not a user
      // This means that we should not consider them as logged in
      const userAccessObject =
        isKeycloakUserLoggedIn && keycloak.idTokenParsed?.tolkevarav

      if (!userAccessObject) {
        handleLogoutWithError()
        return
      }
      setAccessToken(keycloak.token)
      const data: InstitutionType[] = await apiClient.get(
        endpoints.INSTITUTIONS
      )
      if (size(data) === 0) {
        handleLogoutWithError()
        return
      }
      keycloak.onAuthRefreshSuccess = () => {
        // Set new access token + restart refreshing interval
        setAccessToken(keycloak.token)
        startRefreshingToken()
      }
      // Now user is logged in
      // Check if they have some institution already selected
      if (!userAccessObject?.selectedInstitution) {
        // No institution selected
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
      } else {
        finishLogin()
      }
    }
    initKeycloak()
    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { keycloak, isUserLoggedIn, userInfo }
}

export default useKeycloak
