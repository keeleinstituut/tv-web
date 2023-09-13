import { useEffect } from 'react'
import { getPathWithPrivileges, constructFullPath } from 'helpers'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { find, includes } from 'lodash'
import { protectedRoutes } from 'router/router'
import { PrivilegeKey } from 'types/privileges'
import { useTranslation } from 'react-i18next'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'

const useAuthRedirect = (userPrivileges?: PrivilegeKey[]) => {
  const { pathname } = useLocation()
  const params = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const pathsWithPrivileges = getPathWithPrivileges({
    children: protectedRoutes,
  })

  const currentPathPrivileges = find(pathsWithPrivileges, (_, originalPath) => {
    const fullPath = params
      ? constructFullPath(originalPath, params)
      : originalPath
    if (fullPath === pathname) {
      return true
    }
    return false
  })

  const userHasPrivilege =
    !userPrivileges ||
    !currentPathPrivileges ||
    find(currentPathPrivileges, (privilege) =>
      includes(userPrivileges, privilege)
    )

  useEffect(() => {
    if (!userHasPrivilege) {
      navigate('/')
      showNotification({
        type: NotificationTypes.Warning,
        title: t('notification.warning'),
        content: t('warning.missing_permissions'),
      })
    }
    // We want to be certain that this only runs when privilege changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasPrivilege, pathname])
}

export default useAuthRedirect
