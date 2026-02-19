import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'

import { useAuth } from 'components/contexts/AuthContext'
import EditIcon from 'assets/icons/edit.svg?react'
import Container from 'components/atoms/Container/Container'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'

import classes from './classes.module.scss'
import {
  useFetchAuditLogSettings,
  useUpdateAuditLogSettings,
} from 'hooks/requests/useAuditLogs'
import { AuditLogSettingsFormValues } from 'components/organisms/modals/AuditLogSettingsModal/AuditLogSettingsModal'
import { includes } from 'lodash'
import { Privileges } from 'types/privileges'

const AuditLogManagement: FC = () => {
  const { t } = useTranslation()
  const { userInfo, userPrivileges } = useAuth()
  const { selectedInstitution } = userInfo?.tolkevarav || {}
  const institutionId = selectedInstitution?.id || ''
  const { updateSetting } = useUpdateAuditLogSettings({ institutionId })

  const { setting } = useFetchAuditLogSettings({ institutionId })
  const { event_record_retention_time } = setting || {}

  const handleSubmit = useCallback(
    async (values: AuditLogSettingsFormValues) => {
      await updateSetting(values)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.audit_log_settings_updated'),
      })
    },
    [updateSetting, t]
  )

  const handleEdit = () => {
    showModal(ModalTypes.AuditLogSettingsModal, {
      title: t('modal.edit_audit_log_settings'),
      setting,
      updateSetting: handleSubmit,
    })
  }
  const isEditable = includes(userPrivileges, Privileges.EditAuditLogSettings)

  return (
    <Container className={classes.editableContainer}>
      <div className={classes.headerContent}>
        <span className={classes.title}>
          {t('institution.audit_log_settings')}
        </span>
        <Button
          appearance={AppearanceTypes.Text}
          size={SizeTypes.S}
          className={classes.editButton}
          icon={EditIcon}
          onClick={handleEdit}
          hidden={!isEditable}
        >
          {t('button.change')}
        </Button>
      </div>

      <ul>
        <li className={classes.listItem}>
          {t('audit_log.event_record_retention_time')}:{' '}
          {event_record_retention_time} {t('audit_log.retention_time_unit')}
        </li>
      </ul>
    </Container>
  )
}

export default AuditLogManagement
