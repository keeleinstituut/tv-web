import { FC } from 'react'
import { Link } from 'react-router-dom'
import { includes, size } from 'lodash'
import { protectedRoutesForReactRouter } from 'router/router'
import useBreadcrumbs from 'use-react-router-breadcrumbs'

import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import classes from './classes.module.scss'

const Breadcrumbs: FC = () => {
  const breadcrumbs = useBreadcrumbs(protectedRoutesForReactRouter)

  return (
    <nav className={classes.breadcrumbs}>
      {breadcrumbs.map(({ match, breadcrumb, location }, index) => {
        const routePages = includes(match.pathname, '/settings') ? 3 : 2
        const showRoute =
          size(breadcrumbs) > routePages &&
          match.pathname !== '/' &&
          match.pathname !== '/settings'

        if (!showRoute) return null
        return (
          <>
            <Link
              key={match.pathname}
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
              key={index}
              className={classes.arrow}
              aria-label={'arrow'}
            />
          </>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs
