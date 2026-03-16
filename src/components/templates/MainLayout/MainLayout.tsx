import { FC, PropsWithChildren } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import classNames from 'classnames'
import Header from 'components/organisms/Header/Header'
import SideBar from 'components/organisms/SideBar/SideBar'
import Breadcrumbs from 'components/molecules/Breadcrumbs/Breadcrumbs'
import { useIsMobile } from 'hooks/useIsMobile'
import classes from './classes.module.scss'

const MainLayout: FC<PropsWithChildren> = () => {
  const { pathname } = useLocation()
  const isMobile = useIsMobile()
  const isFullscreen = isMobile && pathname === '/calendar/new-order'

  return (
    <main className={classes.mainContainer}>
      {!isFullscreen && <SideBar />}
      <div className={classes.contentContainer}>
        {!isFullscreen && <Header />}
        {!isFullscreen && <Breadcrumbs />}
        <div
          className={classNames(classes.scrollableContent, {
            [classes.scrollableContentFull]: isFullscreen,
          })}
          id="mainScroll"
        >
          <Outlet />
        </div>
      </div>
    </main>
  )
}

export default MainLayout
