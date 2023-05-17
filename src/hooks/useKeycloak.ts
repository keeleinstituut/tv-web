import { useEffect, useState, createContext } from 'react'
import {
  pickBy,
  startsWith,
  mapKeys,
  trim,
  camelCase,
  Dictionary,
} from 'lodash'
import Keycloak, { KeycloakConfig } from 'keycloak-js'

export const AuthContext = createContext({
  isUserLoggedIn: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: () => {},
  userId: {},
  token: '',
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

const useKeycloak = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [userId, setUserIdInfo] = useState<object>({})
  const [token, setToken] = useState<string>('')
  useEffect(() => {
    const initKeycloak = async () => {
      const isUserLoggedIn = await keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
      })
      setIsUserLoggedIn(isUserLoggedIn)
      if (isUserLoggedIn) {
        console.log('keycloak', keycloak)
        setUserIdInfo(keycloak?.idTokenParsed || {})
        setToken(keycloak?.token || '')
      }
    }
    initKeycloak()
  }, [])

  return { keycloak, isUserLoggedIn, userId, token }
}

export default useKeycloak
