import { FC, PropsWithChildren, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import useKeycloak, { AuthContext } from 'hooks/useKeycloak'
import ModalRoot from 'components/organisms/modals/ModalRoot'
import Landing from 'pages/Landing/Landing'
import useAuthRedirect from 'hooks/useAuthRedirect'
import Loader from 'components/atoms/Loader/Loader'
import classes from './classes.module.scss'
import { useQueryClient } from '@tanstack/react-query'

const AuthWrapper: FC<PropsWithChildren> = () => {
  const { keycloak, isUserLoggedIn, userInfo, isLoading } = useKeycloak()
  const queryClient = useQueryClient()
  useAuthRedirect(userInfo?.tolkevarav?.privileges)

  const handleLogout = useCallback(() => {
    if (keycloak) {
      keycloak.logout()
      queryClient.clear()
      keycloak.clearToken()
    }
  }, [keycloak, queryClient])

  return (
    <AuthContext.Provider
      value={{
        isUserLoggedIn,
        userInfo,
        login: keycloak && keycloak.login,
        logout: handleLogout,
        userPrivileges: userInfo?.tolkevarav?.privileges || [],
        institutionUserId: userInfo?.tolkevarav?.institutionUserId || '',
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
