import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { includes } from 'lodash'
import { useTranslation } from 'react-i18next'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import useAuth from './useAuth'
import { Privileges } from 'types/privileges'

const useOrderPageRedirect = ({
  client_user_institution_id,
  translation_manager_user_institution_id,
  isLoading,
}: {
  client_user_institution_id?: string
  translation_manager_user_institution_id?: string
  isLoading?: boolean
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { institutionUserId, userPrivileges } = useAuth()
  const isUserClientOfProject = institutionUserId === client_user_institution_id
  const isUserTranslationManagerOfProject =
    institutionUserId === translation_manager_user_institution_id

  const canAnyoneViewProject =
    includes(userPrivileges, Privileges.ViewInstitutionProjectDetail) ||
    (includes(
      userPrivileges,
      Privileges.ViewInstitutionUnclaimedProjectDetail
    ) &&
      !translation_manager_user_institution_id)

  const canUserViewOrder =
    includes(userPrivileges, Privileges.ViewPersonalProject) &&
    (isUserClientOfProject ||
      isUserTranslationManagerOfProject ||
      canAnyoneViewProject)

  useEffect(() => {
    if (!isLoading && !client_user_institution_id) {
      navigate(-1)
      showNotification({
        type: NotificationTypes.Warning,
        title: t('notification.warning'),
        content: t('warning.order_does_not_exist'),
      })
    } else if (!canUserViewOrder && !isLoading) {
      navigate(-1)
      showNotification({
        type: NotificationTypes.Warning,
        title: t('notification.warning'),
        content: t('warning.missing_permissions'),
      })
    }
    // We want to be certain that this only runs when privilege changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUserViewOrder, navigate])
}

export default useOrderPageRedirect
