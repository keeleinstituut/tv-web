import { FC, PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'
// import Header from 'components/organisms/Header/Header'
import SideBar from 'components/organisms/SideBar/SideBar'
import classes from './styles.module.scss'

const MainLayout: FC<PropsWithChildren> = (props) => {
  return (
    <main className={classes.mainContainer}>
      {/* <Header /> */}
      <SideBar />
      <div className={classes.contentContainer}>
        <Outlet />
      </div>
    </main>
  )
}

export default MainLayout
