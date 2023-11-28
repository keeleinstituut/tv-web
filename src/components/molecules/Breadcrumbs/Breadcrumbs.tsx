import { FC } from 'react'
import { Link } from 'react-router-dom'
import { includes, size, map, filter } from 'lodash'
import { protectedRoutesForReactRouter } from 'router/router'
import useBreadcrumbs from 'use-react-router-breadcrumbs'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'

import classes from './classes.module.scss'

const Breadcrumbs: FC = () => {
  const breadcrumbs = useBreadcrumbs(protectedRoutesForReactRouter)

  const isHistoryTask = includes(
    breadcrumbs[4]?.match?.pathname,
    '/isHistoryView'
  )
  // TODO: This is custom logic for removing a crumb on history task page for :isHistoryView route, if smth similar comes, add neater solution
  const historyTaskBreadcrumbs = filter(breadcrumbs, (_, index) => index !== 3)
  const newBreadcrumbs = isHistoryTask ? historyTaskBreadcrumbs : breadcrumbs

  return (
    <div className={classes.breadcrumbs}>
      {map(newBreadcrumbs, ({ match, breadcrumb, location }, index) => {
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
