import { FC, PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'
import useKeycloak, { AuthContext } from 'hooks/useKeycloak'
import Landing from 'pages/Landing/Landing'

const AuthWrapper: FC<PropsWithChildren> = () => {
  const { keycloak, isUserLoggedIn, userId, token } = useKeycloak()

  return (
    <AuthContext.Provider
      value={{
        isUserLoggedIn,
        token,
        userId,
        login: keycloak && keycloak.login,
        logout: keycloak && keycloak.logout,
      }}
    >
      {isUserLoggedIn ? <Outlet /> : <Landing />}
    </AuthContext.Provider>
  )
}

export default AuthWrapper
