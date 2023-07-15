import { FC, PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'
import useKeycloak, { AuthContext } from 'hooks/useKeycloak'
import ModalRoot from 'components/organisms/modals/ModalRoot'
import Landing from 'pages/Landing/Landing'
import Loader from 'components/atoms/Loader/Loader'
import classes from './classes.module.scss'

const AuthWrapper: FC<PropsWithChildren> = () => {
  const { keycloak, isUserLoggedIn, userInfo, isLoading } = useKeycloak()

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
      <Loader
        loading={isLoading && !isUserLoggedIn}
        className={classes.fullScreenLoader}
      />
      {isUserLoggedIn && <Outlet />}
      {!isUserLoggedIn && !isLoading && <Landing />}
      <ModalRoot />
    </AuthContext.Provider>
  )
}

export default AuthWrapper
