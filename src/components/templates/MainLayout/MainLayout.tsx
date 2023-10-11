import { FC, PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'
import Header from 'components/organisms/Header/Header'
import SideBar from 'components/organisms/SideBar/SideBar'
import classes from './classes.module.scss'
import Breadcrumbs from 'components/molecules/Breadcrumbs/Breadcrumbs'

const MainLayout: FC<PropsWithChildren> = () => (
  <main className={classes.mainContainer}>
    <SideBar />
    <div className={classes.contentContainer}>
      <Header />
      <Breadcrumbs />
      <div className={classes.scrollableContent} id="mainScroll">
        <Outlet />
      </div>
    </div>
  </main>
)

export default MainLayout
