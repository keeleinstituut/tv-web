import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { find, includes } from 'lodash'
import { Root } from '@radix-ui/react-form'

import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import TextInput from 'components/molecules/TextInput/TextInput'
import Loader from 'components/atoms/Loader/Loader'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import {
  useAcceptOutsourceRequest,
  useFetchOutsourceRequest,
} from 'hooks/requests/useProjectRequests'
import {
  OutsourceRequestMode,
  OutsourceRequestStatus,
} from 'types/projectRequests'

import classes from './classes.module.scss'

const formatDateTime = (iso?: string | null) =>
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

  const { request, isLoading } = useFetchOutsourceRequest(requestId)
  const { acceptOutsourceRequest, isLoading: isAccepting } =
    useAcceptOutsourceRequest(requestId ?? '')

  const [offeredPrice, setOfferedPrice] = useState('')
  const [responseComment, setResponseComment] = useState('')

  const hasFixedPrice =
    request?.fixed_price !== null && request?.fixed_price !== undefined

  const handleAccept = useCallback(async () => {
    try {
      const priceNumber = offeredPrice.trim()
        ? Number(offeredPrice.replace(',', '.'))
        : undefined
      await acceptOutsourceRequest({
        proposed_price:
          !hasFixedPrice && Number.isFinite(priceNumber)
            ? priceNumber
            : undefined,
        response_comment: responseComment.trim() || undefined,
      })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('requests.accept_confirmation'),
      })
    } catch (error) {
      showValidationErrorMessage(error)
    }
  }, [acceptOutsourceRequest, offeredPrice, responseComment, hasFixedPrice, t])

  const handleOpenDeclineModal = useCallback(() => {
    if (!requestId) return
    showModal(ModalTypes.ConfirmDeclineRequest, { requestId })
  }, [requestId])

  if (isLoading) return <Loader loading />
  if (!request)
    return (
      <>
        <div className={classes.titleRow}>
          <h1>{t('requests.detail_title')}</h1>
        </div>
        <p className={classes.notFound}>{t('requests.detail_not_found')}</p>
      </>
    )

  const isOpenForResponse =
    request.status === OutsourceRequestStatus.Active &&
    !request.is_cascade_exhausted
  const showResponseActions = canRespond && isOpenForResponse

  // Per spec §102 "Tellija kommentaar" surfaces the TPM's reason text either
  // when the request was cancelled (cancellation_reason) or when this
  // institution's offer was rejected in favour of another (rejection_comment).
  const clientComment =
    request.cancellation_reason ??
    find(request.offers ?? [], (o) => !!o.rejection_comment)
      ?.rejection_comment ??
    null

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('requests.detail_title')}</h1>
        <span className={classes.statusBadge}>
          {t(`requests.request_status.${request.status}`)}
        </span>
      </div>

      <div className={classes.sections}>
        <section className={classes.section}>
          <h2 className={classes.sectionTitle}>
            {t('requests.section_request_details')}
          </h2>
          <Field
            label={t('requests.field_mode')}
            value={t(`requests.mode.${request.mode}`)}
          />
          <Field
            label={t('requests.field_reaction_time')}
            value={t('requests.reaction_time_minutes', {
              count: request.reaction_time_minutes,
            })}
          />
          {request.mode === OutsourceRequestMode.Parallel && (
            <Field
              label={t('requests.field_deadline')}
              value={formatDateTime(request.deadline_at)}
            />
          )}
          <Field
            label={t('requests.field_special_instructions')}
            value={request.special_instructions}
          />
          <Field
            label={t('requests.field_status')}
            value={t(`requests.request_status.${request.status}`)}
          />
          {clientComment && (
            <Field
              label={t('requests.field_client_comment')}
              value={clientComment}
            />
          )}
        </section>

        <section className={classes.section}>
          <h2 className={classes.sectionTitle}>
            {t('requests.section_project_details')}
          </h2>
          <Field
            label={t('requests.field_source_files')}
            value={
              request.include_source_files
                ? t('requests.files_shared_with_request')
                : t('requests.files_not_shared')
            }
          />
          <Field
            label={t('requests.field_price')}
            value={
              hasFixedPrice
                ? `${request.fixed_price}€`
                : t('requests.price_not_fixed')
            }
          />
          <Field
            label={t('requests.field_created_at')}
            value={formatDateTime(request.created_at)}
          />
        </section>
      </div>

      {showResponseActions && (
        <section className={classes.responseSection}>
          <h2 className={classes.sectionTitle}>
            {t('requests.section_response')}
          </h2>
          <p className={classes.responseHint}>{t('requests.response_hint')}</p>
          <Root
            className={classes.responseFields}
            onSubmit={(e) => e.preventDefault()}
          >
            {!hasFixedPrice && (
              <div className={classes.responseField}>
                <TextInput
                  name="offered_price"
                  ariaLabel={t('requests.response_price_label')}
                  label={t('requests.response_price_label')}
                  placeholder={t('requests.response_price_placeholder')}
                  type="number"
                  min={0}
                  step="0.01"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                />
                <span className={classes.priceSuffix}>€</span>
              </div>
            )}
            <TextInput
              name="response_comment"
              ariaLabel={t('requests.response_comment_label')}
              label={t('requests.response_comment_label')}
              placeholder={t('requests.response_comment_placeholder')}
              value={responseComment}
              onChange={(e) => setResponseComment(e.target.value)}
              isTextarea
            />
          </Root>
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
              {t('requests.accept_request_short')}
            </Button>
          </div>
        </section>
      )}
    </>
  )
}

export default RequestDetailPage
