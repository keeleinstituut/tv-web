import { FC, MouseEvent, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { map, find } from 'lodash'
import { ReactComponent as ChevronLeft } from 'assets/icons/chevron_left.svg'
import { ReactComponent as ArrowUp } from 'assets/icons/arrow_up.svg'
import { ReactComponent as Burger } from 'assets/icons/burger.svg'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { protectedRoutes, FullRouteObject } from 'router/router'
import classNames from 'classnames'
import classes from './styles.module.scss'

interface MenuItemsProps {
  menuItems: FullRouteObject[]
  parentPath?: string
}

const MenuItems: FC<MenuItemsProps> = ({ menuItems, parentPath }) => {
  const location = useLocation()
  const handleNavToggle = (event: MouseEvent) => {
    const isExpanded =
      event.currentTarget.getAttribute('aria-expanded') === 'true'
    event.currentTarget.setAttribute(
      'aria-expanded',
      isExpanded ? 'false' : 'true'
    )
  }
  return (
    <>
      {map(menuItems, ({ children, path, Icon, isInterTitle, label }) => {
        const fullPath = parentPath ? `${parentPath}/${path}` : `/${path}`
        const hasChildrenToShow = children && find(children, 'label')
        if (!label) return null
        if (!hasChildrenToShow) {
          return (
            <li key={label}>
              <NavLink to={fullPath} className={classes.listItem}>
                {Icon ? <Icon className={classes.itemIcon} /> : null}
                <span>{label}</span>
              </NavLink>
            </li>
          )
        }
        return (
          <li key={label}>
            <BaseButton
              className={classNames(
                classes.listItem,
                isInterTitle && classes.interListItem
              )}
              onClick={handleNavToggle}
              aria-expanded={
                isInterTitle || (path && location.pathname.includes(path))
                  ? 'true'
                  : 'false'
              }
            >
              {Icon ? (
                <Icon
                  className={classNames(
                    classes.itemIcon,
                    parentPath && classes.collapsedIcon
                  )}
                />
              ) : null}
              <span>{label}</span>
              <ArrowUp
                className={classNames(
                  classes.dropdownIcon,
                  classes.expandedIcon
                )}
              />
            </BaseButton>
            <ul
              className={classNames(
                classes.subMenu,
                isInterTitle && classes.interSubMenu
              )}
            >
              <MenuItems menuItems={children} parentPath={fullPath} />
            </ul>
          </li>
        )
      })}
    </>
  )
}

const SideBar: FC = () => {
  const { t } = useTranslation()
  const [navCollapsed, setNavCollapsed] = useState(false)

  const toggleNavCollapsed = useCallback(() => {
    setNavCollapsed(!navCollapsed)
  }, [navCollapsed, setNavCollapsed])
  return (
    <nav
      className={classNames(
        classes.sidebarContainer,
        navCollapsed && classes.collapsed
      )}
    >
      <BaseButton className={classes.listItem} onClick={toggleNavCollapsed}>
        <Burger className={classes.collapsedIcon} />
        <ChevronLeft
          className={classNames(classes.itemIcon, classes.expandedIcon)}
        />
        <span>{t('menu.collapse_menu')}</span>
      </BaseButton>
      <ul className={classes.menuList}>
        <MenuItems menuItems={protectedRoutes} />
      </ul>
    </nav>
  )
}

export default SideBar
