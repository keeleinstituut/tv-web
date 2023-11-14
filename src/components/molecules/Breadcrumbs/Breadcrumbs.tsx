import { FC } from 'react'
import { Link } from 'react-router-dom'
import { includes, size, map } from 'lodash'
import { protectedRoutesForReactRouter } from 'router/router'
import useBreadcrumbs from 'use-react-router-breadcrumbs'

import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import classes from './classes.module.scss'

const Breadcrumbs: FC = () => {
  const breadcrumbs = useBreadcrumbs(protectedRoutesForReactRouter)

  return (
    <div className={classes.breadcrumbs}>
      {map(breadcrumbs, ({ match, breadcrumb, location }, index) => {
        const routePages = includes(match.pathname, '/settings') ? 3 : 2
        const showRoute =
          size(breadcrumbs) > routePages &&
          match.pathname !== '/' &&
          match.pathname !== '/settings'

        if (!showRoute) return null
        return (
          <nav key={match.pathname} className={classes.nav}>
            <Link
              to={match.pathname}
              className={
                match.pathname === location.pathname
                  ? classes.active
                  : classes.notActive
              }
            >
              {breadcrumb}
            </Link>

            <ArrowRight
              className={
                match.pathname === location.pathname
                  ? classes.hidden
                  : classes.arrow
              }
              aria-label={'arrow'}
            />
          </nav>
        )
      })}
    </div>
  )
}

export default Breadcrumbs
