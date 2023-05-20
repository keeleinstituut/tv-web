import { FC, PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'
import useKeycloak, { AuthContext } from 'hooks/useKeycloak'
import Landing from 'pages/Landing/Landing'

const AuthWrapper: FC<PropsWithChildren> = () => {
  const { keycloak, isUserLoggedIn, userId } = useKeycloak()

  return (
    <AuthContext.Provider
      value={{
        isUserLoggedIn,
        login: keycloak && keycloak.login,
        logout: keycloak && keycloak.logout,
        userId,
      }}
    >
      {isUserLoggedIn ? <Outlet /> : <Landing />}
    </AuthContext.Provider>
  )
}

export default AuthWrapper
