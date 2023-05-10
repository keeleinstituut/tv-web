import { useEffect, useState } from 'react'
import {
  pickBy,
  startsWith,
  mapKeys,
  trim,
  camelCase,
  Dictionary,
} from 'lodash'
import Keycloak, { KeycloakConfig } from 'keycloak-js'

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
  useEffect(() => {
    const initKeycloak = async () => {
      const isUserLoggedIn = await keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
      })
      setIsUserLoggedIn(isUserLoggedIn)
      if (isUserLoggedIn) {
        setUserIdInfo(keycloak?.idTokenParsed || {})
      }
    }
    initKeycloak()
  }, [])

  return { keycloak, isUserLoggedIn, userId }
}

export default useKeycloak
