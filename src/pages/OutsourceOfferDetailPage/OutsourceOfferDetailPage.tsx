import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { find, includes, map } from 'lodash'
import { Root } from '@radix-ui/react-form'
import { useForm } from 'react-hook-form'

import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import TextInput from 'components/molecules/TextInput/TextInput'
import Loader from 'components/atoms/Loader/Loader'
import DetailsRow from 'components/atoms/DetailsRow/DetailsRow'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import DetailsSection from 'components/molecules/DetailsSection/DetailsSection'
import ProjectFilesSection from 'components/molecules/ProjectFilesSection/ProjectFilesSection'
import RequestFilesList from 'components/molecules/RequestFilesList/RequestFilesList'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType, HelperFileTypes } from 'types/classifierValues'
import { SourceFile } from 'types/projects'
import { getProjectDefaultValues } from 'helpers/project'
import {
  useAcceptOutsourceOffer,
  useFetchOutsourceOffer,
} from 'hooks/requests/useOutsourceRequests'
import { OutsourceOfferStatus } from 'types/outsourceRequests'
import { apiTypeToKey } from 'components/molecules/AddVolumeInput/AddVolumeInput'

import classes from './classes.module.scss'

interface FormValues {
  deadline_at: { date?: string; time?: string }
  type_classifier_value_id: string
  client_institution_user_id: string
  manager_institution_user_id: string
  reference_number?: string
  source_language_classifier_value_id: string
  destination_language_classifier_value_ids: string[]
  source_files: (File | SourceFile | undefined)[]
  help_files: (File | SourceFile | undefined)[]
  help_file_types: HelperFileTypes[]
  translation_domain_classifier_value_id: string
  event_start_at?: { date?: string; time?: string }
  event_end_at?: { date?: string; time?: string }
  service_type?: string
  event_location?: string
  meeting_link?: string
  comments?: string
  ext_id?: string
  tags?: string[]
}

const formatDateTime = (iso?: string | null) =>
  iso ? dayjs(iso).format('DD.MM.YYYY HH:mm') : '—'

const OutsourceOfferDetailPage: FC = () => {
  const { t } = useTranslation()
  const { offerId } = useParams()
  const { userPrivileges, institutionUserId } = useAuth()
  const canRespond = includes(userPrivileges, Privileges.RespondToRequests)

  const { offer, isLoading } = useFetchOutsourceOffer(offerId)
  const { acceptOutsourceOffer, isLoading: isAccepting } =
    useAcceptOutsourceOffer(offerId ?? '')

  const project =
    offer?.outsource_request?.assignment?.subProject?.project ?? undefined

  const { classifierValues: domainValues } = useClassifierValuesFetch({
    type: ClassifierValueType.TranslationDomain,
  })
  const { classifierValues: projectTypes } = useClassifierValuesFetch({
    type: ClassifierValueType.ProjectType,
  })

  const defaultDomainClassifier = find(domainValues, { value: 'ASP' })
  const defaultProjectTypeClassifier = find(projectTypes, {
    value: 'TRANSLATION',
  })

  const defaultValues = useMemo(
    () =>
      getProjectDefaultValues({
        institutionUserId: institutionUserId ?? '',
        isNew: false,
        project,
        defaultDomainClassifier,
        defaultProjectTypeClassifier,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project?.id, institutionUserId, defaultDomainClassifier?.id, defaultProjectTypeClassifier?.id]
  )

  const { control, reset } = useForm<FormValues>({ defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const [offeredPrice, setOfferedPrice] = useState('')
  const [responseComment, setResponseComment] = useState('')

  const outsourceRequest = offer?.outsource_request
  const volumes = outsourceRequest?.assignment?.volumes ?? []
  const priceInputNeeded = offer?.price == null

  const handleAccept = useCallback(async () => {
    try {
      const priceNumber = offeredPrice.trim()
        ? Number(offeredPrice.replace(',', '.'))
        : undefined
      await acceptOutsourceOffer({
        price:
          priceInputNeeded && Number.isFinite(priceNumber)
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
  }, [acceptOutsourceOffer, offeredPrice, responseComment, priceInputNeeded, t])

  const handleOpenDeclineModal = useCallback(() => {
    if (!offerId) return
    showModal(ModalTypes.ConfirmDeclineRequest, { offerId })
  }, [offerId])

  if (isLoading) return <Loader loading />
  if (!offer)
    return (
      <>
        <h1>{t('requests.detail_title') as string}</h1>
        <p className={classes.notFound}>{t('requests.detail_not_found')}</p>
      </>
    )

  const isOpenForResponse = offer.status === OutsourceOfferStatus.RequestSent
  const showResponseActions = canRespond && isOpenForResponse

  const clientComment =
    outsourceRequest?.cancellation_reason ?? offer.rejection_comment ?? null

  const manager =
    outsourceRequest?.assignment?.subProject?.project?.manager_institution_user
  const requestOwnerInstitution = outsourceRequest?.owner_institution

  const managerName =
    [manager?.user?.forename, manager?.user?.surname].filter(Boolean).join(' ') ||
    undefined

    return (
    <>
      <ExpandableContentContainer
        leftComponent={
          <h2 className={classes.expandableTitle}>
            {t('requests.section_request_details')}
          </h2>
        }
        rightComponent={
          <span className={classes.statusBadge}>
            {t(`requests.offer_status.${offer.status}`)}
          </span>
        }
        initialIsExpanded
      >
        <div className={classes.contentWrapper}>
          <div className={classes.requestDetailsGrid}>
            <div className={classes.detailsColumn}>
              <h3>{t('requests.subsection_request_data') as string}</h3>
              <DetailsRow
                label={t('label.name')}
                value={managerName ?? '-'}
                labelClass={classes.labelClass}
                valueClass={classes.boldText}
              />
              <DetailsRow
                label={t('label.institution')}
                value={manager?.institution?.name ?? requestOwnerInstitution?.name ?? '-'}
                labelClass={classes.labelClass}
                valueClass={classes.boldText}
              />
              <DetailsRow
                label={t('label.department')}
                value={manager?.department?.name ?? '-'}
                labelClass={classes.labelClass}
                valueClass={classes.boldText}
              />
              <DetailsRow
                label={t('label.email')}
                value={manager?.email ?? requestOwnerInstitution?.email ?? '-'}
                labelClass={classes.labelClass}
                valueClass={classes.boldText}
              />
              <DetailsRow
                label={t('label.phone')}
                value={manager?.phone ?? requestOwnerInstitution?.phone ?? '-'}
                labelClass={classes.labelClass}
                valueClass={classes.boldText}
              />
              <DetailsRow
                label={t('requests.field_client_comment')}
                value={clientComment ?? undefined}
                hidden={!clientComment}
                labelClass={classes.labelClass}
                valueClass={classes.boldText}
              />
            </div>
            <div className={classes.detailsColumn}>
              <h3>{t('requests.subsection_request_extra') as string}</h3>
              <DetailsRow
                label={t('requests.field_deadline')}
                value={formatDateTime(outsourceRequest?.deadline_at)}
                labelClass={classes.labelClass}
                valueClass={classes.boldText}
              />
              <DetailsRow
                label={t('requests.field_special_instructions')}
                value={outsourceRequest?.special_instructions ?? undefined}
                labelClass={classes.labelClass}
                valueClass={classes.boldText}
              />
            </div>
          </div>
        </div>
      </ExpandableContentContainer>

      <ExpandableContentContainer
        className={classes.expandableSpacing}
        leftComponent={
          <h2 className={classes.expandableTitle}>
            {t('requests.section_project_details') as string}
          </h2>
        }
        initialIsExpanded
      >
        <div className={classes.contentWrapper}>
          <div className={classes.projectDetailsContainer}>
            <div>
              <DetailsSection
                control={control}
                isNew={false}
                isEditable={false}
                workflow_started={project?.workflow_started}
              />
              {map(volumes, (volume, index) => (
                <div key={volume.id} className={classes.volumeRow}>
                  <span>{index === 0 ? t('label.volume') : ''}</span>
                  <span>{`${Number(volume.unit_quantity)} ${t(`label.${apiTypeToKey(volume.unit_type)}`)}${volume.cat_job ? ` ${t('task.open_in_cat')}` : ''}`}</span>
                </div>
              ))}
            </div>
            <div>
              <ProjectFilesSection
                projectId={project?.id ?? ''}
                control={control}
                isEditable={false}
              />
              <RequestFilesList
                files={outsourceRequest?.media ?? []}
                title={t('requests.field_request_files')}
                requestId={outsourceRequest?.id ?? ''}
              />
            </div>
          </div>
        </div>
      </ExpandableContentContainer>

      <ExpandableContentContainer
        className={classes.expandableSpacing}
        leftComponent={
          <h2 className={classes.expandableTitle}>
            {t('requests.section_response') as string}
          </h2>
        }
        hidden={!canRespond}
        initialIsExpanded
      >
        <div className={classes.contentWrapper}>
          <Root
            className={classes.responseColumn}
            onSubmit={(e) => e.preventDefault()}
          >
            <label className={classes.responseLabel} htmlFor="offered_price">
              {t('requests.response_price_label')}
            </label>
            <div className={classes.responseField}>
              <TextInput
                name="offered_price"
                ariaLabel={t('requests.response_price_label')}
                placeholder={t('requests.response_price_placeholder')}
                type="number"
                min={0}
                step="0.01"
                value={priceInputNeeded ? offeredPrice : (offer?.price?.toString() ?? '')}
                onChange={(e) => setOfferedPrice(e.target.value)}
                disabled={!priceInputNeeded || !showResponseActions}
              />
              <span className={classes.priceSuffix}>€</span>
            </div>
            <label className={classes.responseLabel} htmlFor="response_comment">
              {t('requests.response_comment_label')}
            </label>
            <TextInput
              name="response_comment"
              ariaLabel={t('requests.response_comment_label')}
              placeholder={t('requests.response_comment_placeholder')}
              value={showResponseActions ? responseComment : (offer?.response_comment ?? '')}
              onChange={(e) => setResponseComment(e.target.value)}
              isTextarea
              className={classes.commentField}
              disabled={!showResponseActions}
            />
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
                  {t('requests.accept_request_short')}
                </Button>
              </div>
            )}
          </Root>
        </div>
      </ExpandableContentContainer>
    </>
  )
}

export default OutsourceOfferDetailPage
