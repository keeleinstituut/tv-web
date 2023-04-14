import { FC, PropsWithChildren } from 'react'
import classes from './MainLayout.module.scss'

const MainLayout: FC<PropsWithChildren> = (props) => {
  const { children } = props
  return <main className={classes.mainContainer}>{children}</main>
}

export default MainLayout
