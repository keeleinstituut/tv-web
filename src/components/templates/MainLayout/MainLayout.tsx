import { FC, PropsWithChildren } from 'react'
import { Outlet, Link } from 'react-router-dom'
import classes from './styles.module.scss'

const MainLayout: FC<PropsWithChildren> = (props) => {
  return (
    <main className={classes.mainContainer}>
      <div id="sidebar">
        <nav>
          <ul>
            <li>
              <Link to={'/dashboard'}>Dashboard</Link>
            </li>
            <li>
              <Link to={'/'}>landing page</Link>
            </li>
          </ul>
        </nav>
      </div>
      <Outlet />
    </main>
  )
}

export default MainLayout
