import { FC, PropsWithChildren } from 'react'
import { Outlet, Link } from 'react-router-dom'
import classes from './MainLayout.module.scss'

const MainLayout: FC<PropsWithChildren> = (props) => {
  return (
    <main className={classes.mainContainer}>
      <div id="sidebar">
        <nav>
          <ul>
            <li>
              <Link to={'/test'}>test page</Link>
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
