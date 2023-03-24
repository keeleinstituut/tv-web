import { FC, useEffect, useState } from 'react'
import MainLayout from 'components/organisms/MainLayout/MainLayout'
import Keycloak from 'keycloak-js'

const keycloak = new Keycloak()

const App: FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | undefined>('')

  useEffect(() => {
    const checkIfUserLoggedIn = async () => {
      const isUserLoggedIn = await keycloak.init({})
      if (isUserLoggedIn) {
        setIsAuthenticated(true)
        setUserId(keycloak?.idTokenParsed?.aud)
      } else {
        setIsAuthenticated(false)
      }
    }
    checkIfUserLoggedIn()
  }, [])

  const testLogin = () => keycloak && keycloak.login()
  return (
    <MainLayout>
      <div />
      {userId && isAuthenticated ? (
        <h1>{userId}</h1>
      ) : (
        <button onClick={testLogin}>Test Login</button>
      )}
    </MainLayout>
  )
}

export default App
