import { FC, PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'
import useKeycloak, { AuthContext } from 'hooks/useKeycloak'
import ModalRoot from 'components/organisms/modals'
import Landing from 'pages/Landing/Landing'

const AuthWrapper: FC<PropsWithChildren> = () => {
  const { keycloak, isUserLoggedIn, userInfo } = useKeycloak()

  return (
    <AuthContext.Provider
      value={{
        isUserLoggedIn,
        userInfo,
        login: keycloak && keycloak.login,
        logout: keycloak && keycloak.logout,
        userPrivileges: userInfo?.tolkevarav?.privileges || [],
      }}
    >
      {isUserLoggedIn ? <Outlet /> : <Landing />}
      <ModalRoot />
    </AuthContext.Provider>
  )
}

export default AuthWrapper
