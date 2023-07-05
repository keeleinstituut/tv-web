import { FC, PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'
import Header from 'components/organisms/Header/Header'
import SideBar from 'components/organisms/SideBar/SideBar'
import classes from './classes.module.scss'

const MainLayout: FC<PropsWithChildren> = () => (
  <main className={classes.mainContainer}>
    <SideBar />
    <div className={classes.contentContainer}>
      <Header />
      <div className={classes.scrollableContent}>
        <Outlet />
      </div>
    </div>
  </main>
)

export default MainLayout
