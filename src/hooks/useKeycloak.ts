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
import { authApiClient, setAccessToken, apiClient } from 'api'
import axios from 'axios'
import { endpoints, authEndpoints } from 'api/endpoints'
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

// const getRefreshInterval = (refreshToken, interval, self) => setInterval(() => {
//   attemptTokenRefresh()
// })

let refreshInterval: NodeJS.Timer | undefined

const onVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    startRefreshingToken()
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
      console.warn('keyclocak', keycloak)
      setAccessToken(keycloak.token)
      const data = await apiClient.get(endpoints.INSTITUTIONS)
      if (size(data) === 0) {
        setIsUserLoggedIn(false)
        return
      }
      if (!userAccessObject?.selectedInstitution) {
        if (size(data) === 1 && !userAccessObject) {
          // TODO: select institution here
          // const selectedInstitutionId = data[0].id
          // const params = new URLSearchParams({
          //   grant_type: 'refresh_token',
          //   client_id: process.env.REACT_APP_KEYCLOAK_client_id || '',
          //   refresh_token: keycloak.refreshToken || '',
          // })
          // await authApiClient.post(authEndpoints.TOKEN, params, {
          //   headers: {
          //     'Content-Type': 'application/x-www-form-urlencoded',
          //     'X-Selected-Institution-ID': selectedInstitutionId,
          //   },
          // })
          // const response = await axios.post(
          //   'https://sso.dev.tolkevarav.eki.ee/realms/tolkevarav-dev/protocol/openid-connect/token',
          //   params,
          //   {
          //     headers: {
          //       'X-Selected-Institution-ID':
          //         '99342849-6f8d-4a90-b3b2-571f551bb7e7',
          //       'Content-Type': 'application/x-www-form-urlencoded',
          //       Accept: '*/*',
          //     },
          //   }
          // )
        } else {
          // TODO: send user to institution selection modal
        }
      }
      setUserIdInfo(keycloak.idTokenParsed || {})
      setIsUserLoggedIn(true)
      // Start refreshing interval
      startRefreshingToken()
      keycloak.onAuthRefreshSuccess = () => {
        // Set new access token + restart refreshing interval
        setAccessToken(keycloak.token)
        startRefreshingToken()
      }
      // Token refreshing stops, when we focus on another tab
      // Make sure we attempt to refresh the token again, when refocusing
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('visibilitychange', onVisibilityChange)
      }
    }
    initKeycloak()
    return () => {
      // Be sure to unsubscribe if a new handler is set
      window.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return { keycloak, isUserLoggedIn, userInfo }
}

export default useKeycloak
