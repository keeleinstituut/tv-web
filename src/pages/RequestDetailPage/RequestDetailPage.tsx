import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { includes } from 'lodash'
import dayjs from 'dayjs'

import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import Loader from 'components/atoms/Loader/Loader'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import {
  useAcceptProjectRequest,
  useFetchProjectRequest,
} from 'hooks/requests/useProjectRequests'
import { ProjectRequestStatus } from 'types/projectRequests'

import classes from './classes.module.scss'

const formatDateTime = (iso?: string) =>
  iso ? dayjs(iso).format('DD.MM.YYYY HH:mm') : '—'

const Field: FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className={classes.field}>
    <span className={classes.fieldLabel}>{label}</span>
    <span className={classes.fieldValue}>{value || '—'}</span>
  </div>
)

const RequestDetailPage: FC = () => {
  const { t } = useTranslation()
  const { requestId } = useParams()
  const { userPrivileges } = useAuth()
  const canRespond = includes(userPrivileges, Privileges.RespondToRequests)

  const { request, isLoading } = useFetchProjectRequest(requestId)
  const { acceptProjectRequest, isLoading: isAccepting } =
    useAcceptProjectRequest(requestId ?? '')

  const handleAccept = useCallback(async () => {
    try {
      await acceptProjectRequest()
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('requests.accept_confirmation'),
      })
    } catch (error) {
      showValidationErrorMessage(error)
    }
  }, [acceptProjectRequest, t])

  const handleOpenDeclineModal = useCallback(() => {
    if (!requestId) return
    showModal(ModalTypes.ConfirmDeclineRequest, { requestId })
  }, [requestId])

  if (isLoading) return <Loader loading />
  if (!request)
    return (
      <div className={classes.titleRow}>
        <h1>{t('requests.detail_title')}</h1>
      </div>
    )

  const isOpenForResponse = request.status === ProjectRequestStatus.Pending
  const showResponseActions = canRespond && isOpenForResponse

  const [sourceLang, targetLang] =
    (request.language_pair || '').split(' → ').length === 2
      ? request.language_pair!.split(' → ')
      : ['', '']

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('requests.detail_title')}</h1>
        <span className={classes.statusBadge}>
          {t(`requests.status.${request.status}`)}
        </span>
      </div>

      <div className={classes.sections}>
        <section className={classes.section}>
          <h2 className={classes.sectionTitle}>
            {t('requests.section_request_details')}
          </h2>
          <Field
            label={t('requests.field_requestor_name')}
            value={request.requestor_institution_name}
          />
          <Field
            label={t('requests.field_institution')}
            value={request.requestor_institution_name}
          />
          <Field
            label={t('requests.field_email')}
            value={request.requestor_email}
          />
          <Field label={t('requests.field_phone')} value="—" />
          <Field
            label={t('requests.field_special_instructions')}
            value={request.special_instructions}
          />
          <Field
            label={t('requests.field_deadline')}
            value={formatDateTime(request.response_deadline_at)}
          />
          <Field
            label={t('requests.field_status')}
            value={t(`requests.status.${request.status}`)}
          />
          {request.cancellation_comment && (
            <Field
              label={t('requests.field_client_comment')}
              value={request.cancellation_comment}
            />
          )}
        </section>

        <section className={classes.section}>
          <h2 className={classes.sectionTitle}>
            {t('requests.section_project_details')}
          </h2>
          <Field
            label={t('requests.field_project_id')}
            value={request.project_ext_id}
          />
          <Field
            label={t('requests.field_project_type')}
            value={request.project_type_name}
          />
          <Field label={t('requests.field_domain')} value="—" />
          <Field
            label={t('requests.field_project_deadline')}
            value={formatDateTime(request.response_deadline_at)}
          />
          <Field
            label={t('requests.field_source_language')}
            value={sourceLang || '—'}
          />
          <Field
            label={t('requests.field_target_language')}
            value={targetLang || '—'}
          />
          <Field
            label={t('requests.field_source_files')}
            value={
              request.include_project_files
                ? t('requests.files_shared_with_request')
                : t('requests.files_not_shared')
            }
          />
          <Field label={t('requests.field_volume')} value="—" />
        </section>
      </div>

      {showResponseActions && (
        <div className={classes.footer}>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={handleOpenDeclineModal}
          >
            {t('requests.decline_request')}
          </Button>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={handleAccept}
            loading={isAccepting}
          >
            {t('requests.accept_request')}
          </Button>
        </div>
      )}
    </>
  )
}

export default RequestDetailPage
