import { useEffect, useState, createContext } from 'react'
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

const useKeycloak = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [userInfo, setUserIdInfo] = useState<UserInfoType>({})
  useEffect(() => {
    const initKeycloak = async () => {
      const isKeycloakUserLoggedIn = await keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
      })
      const userAccessObject =
        isKeycloakUserLoggedIn && keycloak.idTokenParsed?.tolkevarav

      // Currently if used does not have the "tolkevarav" object in their idToken, they are not a user
      // This means that we should not consider them as logged in
      if (!userAccessObject) {
        setIsUserLoggedIn(false)
        return
      }
      setAccessToken(keycloak.token)
      keycloak.onAuthRefreshSuccess = () => {
        // Set new access token + restart refreshing interval
        setAccessToken(keycloak.token)
        startRefreshingToken()
      }
      const data = await apiClient.get(endpoints.INSTITUTIONS)
      if (size(data) === 0) {
        setIsUserLoggedIn(false)
        return
      }
      if (!userAccessObject?.selectedInstitution) {
        if (size(data) === 1) {
          const selectedInstitutionId = data[0].id
          const params = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: process.env.REACT_APP_KEYCLOAK_client_id || '',
            refresh_token: keycloak.refreshToken || '',
          })
          // select institution for user
          await axios.post(
            'https://sso.dev.tolkevarav.eki.ee/realms/tolkevarav-dev/protocol/openid-connect/token',
            params,
            {
              headers: {
                'X-Selected-Institution-ID': selectedInstitutionId,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: '*/*',
              },
            }
          )
          // refresh token, to update state for keycloak
          await keycloak.updateToken(Infinity)
        } else {
          // TODO: send user to institution selection modal
        }
      }
      setUserIdInfo(keycloak.idTokenParsed || {})
      setIsUserLoggedIn(true)
      // Start refreshing interval
      startRefreshingToken()
      // Token refreshing stops, when window is not visible and doesn't start again, when
      // it becomes visible again
      // Refresh the token again, when window becomes visible again
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('visibilitychange', onVisibilityChange)
      }
    }
    initKeycloak()
    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return { keycloak, isUserLoggedIn, userInfo }
}

export default useKeycloak
