import { FC, PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'
import ModalRoot from 'components/organisms/modals/ModalRoot'
import Landing from 'pages/Landing/Landing'
import useAuthRedirect from 'hooks/useAuthRedirect'
import Loader from 'components/atoms/Loader/Loader'
import classes from './classes.module.scss'
import { useAuth } from 'components/contexts/AuthContext'

const AuthWrapper: FC<PropsWithChildren> = () => {
  const auth = useAuth()
  const { isUserLoggedIn, initializing: isLoading, userInfo } = auth
  useAuthRedirect(userInfo?.tolkevarav?.privileges)

  return (
    <>
      <Loader
        loading={isLoading && !isUserLoggedIn}
        className={classes.fullScreenLoader}
      />
      {isUserLoggedIn && <Outlet />}
      {!isUserLoggedIn && !isLoading && <Landing />}
      <ModalRoot />
    </>
  )
}

export default AuthWrapper
