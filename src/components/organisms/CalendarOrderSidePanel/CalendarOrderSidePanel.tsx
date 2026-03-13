import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { formatDuration } from 'helpers/calendar'
import { isSlotPast } from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'
import {
  useCreateCalendarOrder,
  useUpdateCalendarOrder,
  useCancelCalendarOrder,
  useAcceptCalendarOrder,
  useDeclineCalendarOrder,
  useFetchSlotMatching,
} from 'hooks/requests/useCalendar'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import CloseIcon from 'assets/icons/close.svg?react'
import AttachIcon from 'assets/icons/attach.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import DownloadIcon from 'assets/icons/download.svg?react'
import classes from './classes.module.scss'

type ServiceType = 'kaugtolge' | 'kontakttolge' | ''

const CalendarOrderSidePanel: FC = () => {
  const { t } = useTranslation()
  const { sidePanelSelection, closeSidePanel } = useCalendarContext()
  const { isTPM, isClient, isTranslator } = useCalendarRole()
  const navigate = useNavigate()
  const { mutate: createOrder, isPending: isCreating } =
    useCreateCalendarOrder()
  const { mutate: updateOrder, isPending: isUpdating } =
    useUpdateCalendarOrder()
  const { mutate: cancelOrder, isPending: isCancelling } =
    useCancelCalendarOrder()
  const { mutate: acceptOrder, isPending: isAccepting } =
    useAcceptCalendarOrder()
  const { mutate: declineOrder, isPending: isDeclining } =
    useDeclineCalendarOrder()

  const [viitenumber, setViitenumber] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('')
  const [location, setLocation] = useState('')
  const [tellija, setTellija] = useState('')
  const [domainId, setDomainId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
  const [isMetaOpen, setIsMetaOpen] = useState(false)
  const [isChangingDuration, setIsChangingDuration] = useState(false)
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [durationNote, setDurationNote] = useState('')

  const isOpen = sidePanelSelection !== null
  const isViewMode = !!sidePanelSelection?.slot
  const isAcceptMode = isViewMode && sidePanelSelection?.intent === 'accept'
  const isTranslatorView = isTranslator && isViewMode
  const isTranslatorConfirmedView = isTranslatorView && !isAcceptMode
  const isFormMode = !isViewMode || isEditing

  const language = sidePanelSelection?.language
  const startIso = sidePanelSelection?.startIso
  const endIso = sidePanelSelection?.endIso
  const slot = sidePanelSelection?.slot

  const date = startIso ? dayjs(startIso).format('DD.MM.YYYY') : ''
  const startTime = startIso ? dayjs(startIso).format('HH:mm') : ''
  const duration = startIso && endIso ? formatDuration(startIso, endIso) : ''
  const slotDurationMinutes =
    startIso && endIso ? dayjs(endIso).diff(dayjs(startIso), 'minute') : 60

  const formatDurationMins = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m} min`
    if (m === 0) return `${h} ${h === 1 ? 'tund' : 'tundi'}`
    return `${h}h ${m}min`
  }

  const projectId = slot?.assignment?.sub_project?.id
  const canEdit = isTPM || isClient
  const isPastSlot = slot ? isSlotPast(slot.start_at) : false

  // Slot matching for Teostaja — only fetch in form mode
  const slotMatchingParams =
    isFormMode && isTPM && startIso && endIso && language
      ? { start_at: startIso, end_at: endIso, language_id: language.language.id }
      : null
  const { vendors } = useFetchSlotMatching(slotMatchingParams)

  // Domains for Valdkond
  const { classifierValues: domains } = useClassifierValuesFetch(
    isFormMode
      ? { type: ClassifierValueType.TranslationDomain }
      : undefined
  )

  // Reset state when panel opens/closes
  useEffect(() => {
    if (!isOpen) {
      setViitenumber('')
      setServiceType('')
      setLocation('')
      setTellija('')
      setDomainId('')
      setVendorId('')
      setIsEditing(false)
      setIsConfirmingCancel(false)
      setIsMetaOpen(false)
      setIsChangingDuration(false)
      setDurationMinutes(60)
      setDurationNote('')
    } else if (isAcceptMode) {
      // Unconfirmed accept panel: metaandmed expanded by default
      setIsMetaOpen(true)
    }
  }, [isOpen, isAcceptMode])

  const handleSubmit = () => {
    if (!language || !startIso || !endIso) return
    createOrder(
      {
        language_id: language.language.id,
        start_at: startIso,
        end_at: endIso,
        service_type: serviceType === 'kaugtolge' ? 'remote' : 'on-site',
        reference_number: viitenumber || undefined,
        location: serviceType === 'kontakttolge' ? location : undefined,
        meeting_link: serviceType === 'kaugtolge' ? location : undefined,
        client_institution_id: isTPM ? tellija || undefined : undefined,
        domain_id: domainId || undefined,
        vendor_id: isTPM ? vendorId || undefined : undefined,
      },
      {
        onSuccess: () => {
          closeSidePanel()
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.calendar_order_created'),
          })
        },
      }
    )
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setIsConfirmingCancel(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setViitenumber('')
    setServiceType('')
    setLocation('')
    setTellija('')
    setDomainId('')
    setVendorId('')
  }

  const handleSaveEdit = () => {
    if (!projectId) return
    updateOrder(
      {
        id: projectId,
        service_type:
          serviceType === 'kaugtolge'
            ? 'remote'
            : serviceType === 'kontakttolge'
              ? 'on-site'
              : undefined,
        reference_number: viitenumber || undefined,
        location: serviceType === 'kontakttolge' ? location : undefined,
        meeting_link: serviceType === 'kaugtolge' ? location : undefined,
        client_institution_id: isTPM ? tellija || undefined : undefined,
        domain_id: domainId || undefined,
        vendor_id: isTPM ? vendorId || undefined : undefined,
      },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  const handleVoidConfirm = () => {
    if (!projectId) return
    cancelOrder(projectId, {
      onSuccess: () => {
        closeSidePanel()
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_order_cancelled'),
        })
      },
    })
  }

  const handleAccept = () => {
    if (!projectId) return
    acceptOrder(projectId, {
      onSuccess: () => {
        closeSidePanel()
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_order_accepted'),
        })
      },
    })
  }

  const handleDecline = () => {
    if (!projectId) return
    declineOrder(projectId, {
      onSuccess: () => {
        closeSidePanel()
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_order_declined'),
        })
      },
    })
  }

  const handleStartChangeDuration = () => {
    setDurationMinutes(slotDurationMinutes)
    setIsMetaOpen(true)
    setIsChangingDuration(true)
  }

  const handleCancelChangeDuration = () => {
    setIsChangingDuration(false)
    setDurationNote('')
  }

  const handleSaveDuration = () => {
    if (!projectId || !startIso) return
    const newEndIso = dayjs(startIso)
      .add(durationMinutes, 'minute')
      .toISOString()
    updateOrder(
      { id: projectId, end_at: newEndIso },
      {
        onSuccess: () => {
          setIsChangingDuration(false)
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.calendar_duration_saved'),
          })
        },
      }
    )
  }

  return (
    <>
      {isOpen && <div className={classes.backdrop} onClick={closeSidePanel} />}
      <div className={`${classes.panel} ${isOpen ? classes.open : ''}`}>
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.headerTitle}>
            {isViewMode
              ? (slot?.assignment?.sub_project.ext_id ?? t('calendar.order'))
              : t('calendar.new_order')}
          </div>
          <div className={classes.headerActions}>
            {isViewMode && projectId && (
              <button
                className={classes.headerBtn}
                onClick={() => navigate(`/calendar/${projectId}`)}
              >
                {t('calendar.open')}
                <span className={classes.headerBtnArrow}>↗</span>
              </button>
            )}
            <button className={classes.headerBtn} onClick={closeSidePanel}>
              {t('calendar.close')}
              <CloseIcon className={classes.headerBtnIcon} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className={classes.body}>
          {isTranslatorView ? (
            <>
              {/* Action buttons — hidden for past confirmed slots; accept always visible */}
              {(!isPastSlot || isAcceptMode) && <div className={classes.translatorActions}>
                {isChangingDuration ? (
                  <Button
                    appearance={AppearanceTypes.Secondary}
                    onClick={() => setIsConfirmingCancel(true)}
                    disabled={isCancelling}
                  >
                    {t('calendar.cancel_order')}
                  </Button>
                ) : isAcceptMode ? (
                  <>
                    <Button
                      appearance={AppearanceTypes.Primary}
                      onClick={handleAccept}
                      disabled={isAccepting || isDeclining}
                    >
                      {isAccepting
                        ? t('calendar.saving')
                        : t('calendar.accept')}
                    </Button>
                    <Button
                      appearance={AppearanceTypes.Secondary}
                      onClick={handleDecline}
                      disabled={isAccepting || isDeclining}
                    >
                      {isDeclining
                        ? t('calendar.saving')
                        : t('calendar.decline')}
                    </Button>
                  </>
                ) : isConfirmingCancel ? (
                  <>
                    <Button
                      appearance={AppearanceTypes.Primary}
                      onClick={handleVoidConfirm}
                      disabled={isCancelling}
                    >
                      {isCancelling
                        ? t('calendar.voiding')
                        : t('calendar.void_confirm_yes')}
                    </Button>
                    <Button
                      appearance={AppearanceTypes.Secondary}
                      onClick={() => setIsConfirmingCancel(false)}
                      disabled={isCancelling}
                    >
                      {t('calendar.void_confirm_no')}
                    </Button>
                  </>
                ) : (
                  <>
                    {isTranslatorConfirmedView && (
                      <Button
                        appearance={AppearanceTypes.Primary}
                        onClick={handleStartChangeDuration}
                      >
                        {t('calendar.change_duration')}
                      </Button>
                    )}
                    <Button
                      appearance={AppearanceTypes.Secondary}
                      onClick={() => setIsConfirmingCancel(true)}
                    >
                      {t('calendar.cancel_order')}
                    </Button>
                  </>
                )}
              </div>}

              {/* Read-only order fields */}
              <div className={classes.form}>
                <div className={classes.formGroup}>
                  <label className={classes.label}>
                    {t('calendar.language')}
                  </label>
                  <span className={classes.readValue}>
                    {language?.language.name ?? ''}
                  </span>
                </div>
                <div className={classes.formGroup}>
                  <label className={classes.label}>{t('calendar.date')}</label>
                  <span className={classes.readValue}>{date}</span>
                </div>
                <div className={classes.formGroup}>
                  <label className={classes.label}>
                    {t('calendar.start')}
                  </label>
                  <span className={classes.readValue}>{startTime}</span>
                </div>

                {/* Kestus — stepper in change mode, read-only otherwise */}
                <div className={classes.durationGroup}>
                  <label className={classes.label}>
                    {t('calendar.duration')}
                  </label>
                  {isChangingDuration ? (
                    <div className={classes.durationStepper}>
                      <button
                        className={classes.stepperBtn}
                        onClick={() =>
                          setDurationMinutes((v) => Math.max(30, v - 30))
                        }
                      >
                        −
                      </button>
                      <span className={classes.stepperValue}>
                        {formatDurationMins(durationMinutes)}
                      </span>
                      <button
                        className={classes.stepperBtn}
                        onClick={() =>
                          setDurationMinutes((v) => v + 30)
                        }
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className={classes.readValue}>{duration}</span>
                  )}
                </div>

                {slot?.assignment?.service_type && (
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.order_way')}
                    </label>
                    <span className={classes.readValue}>
                      {slot.assignment.service_type === 'remote'
                        ? t('calendar.service_type_remote')
                        : t('calendar.service_type_contact')}
                    </span>
                  </div>
                )}
                {slot?.assignment?.location && (
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.location')}
                    </label>
                    <span className={classes.readValue}>
                      {slot.assignment.location}
                    </span>
                  </div>
                )}
                {slot?.assignment?.meeting_link && (
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.meeting_link')}
                    </label>
                    <a
                      className={classes.meetingLink}
                      href={`https://${slot.assignment.meeting_link}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {slot.assignment.meeting_link}
                    </a>
                  </div>
                )}

                {/* Collapsible metaandmed */}
                <button
                  className={classes.metaToggle}
                  onClick={() => setIsMetaOpen((v) => !v)}
                >
                  <ArrowDownIcon
                    className={classNames(classes.metaIcon, {
                      [classes.metaIconOpen]: isMetaOpen,
                    })}
                  />
                  <span>{t('calendar.order_meta')}</span>
                </button>
                {isMetaOpen && (
                  <div className={classes.metaContent}>
                    {slot?.assignment?.reference_number && (
                      <div className={classes.metaGroup}>
                        <span className={classes.metaLabel}>
                          {t('calendar.reference_number')}
                        </span>
                        <span className={classes.metaValue}>
                          {slot.assignment.reference_number}
                        </span>
                      </div>
                    )}
                    {slot?.assignment?.client && (
                      <>
                        <div className={classes.metaRow}>
                          <div className={classes.metaGroup}>
                            <span className={classes.metaLabel}>
                              {t('calendar.client_name')}
                            </span>
                            <span className={classes.metaValue}>
                              {slot.assignment.client.name}
                            </span>
                          </div>
                          <div className={classes.metaGroup}>
                            <span className={classes.metaLabel}>
                              {t('calendar.institution')}
                            </span>
                            <span className={classes.metaValue}>
                              {slot.assignment.client.institution}
                            </span>
                          </div>
                        </div>
                        <div className={classes.metaRow}>
                          <div className={classes.metaGroup}>
                            <span className={classes.metaLabel}>
                              {t('calendar.email')}
                            </span>
                            <span className={classes.metaValue}>
                              {slot.assignment.client.email}
                            </span>
                          </div>
                          <div className={classes.metaGroup}>
                            <span className={classes.metaLabel}>
                              {t('calendar.phone')}
                            </span>
                            <span className={classes.metaValue}>
                              {slot.assignment.client.phone}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    {slot?.assignment?.coordinator && (
                      <>
                        <div className={classes.metaGroup}>
                          <span className={classes.metaLabel}>
                            {t('calendar.coordinator_name')}
                          </span>
                          <span className={classes.metaValue}>
                            {slot.assignment.coordinator.name}
                          </span>
                        </div>
                        <div className={classes.metaRow}>
                          <div className={classes.metaGroup}>
                            <span className={classes.metaLabel}>
                              {t('calendar.email')}
                            </span>
                            <span className={classes.metaValue}>
                              {slot.assignment.coordinator.email}
                            </span>
                          </div>
                          <div className={classes.metaGroup}>
                            <span className={classes.metaLabel}>
                              {t('calendar.phone')}
                            </span>
                            <span className={classes.metaValue}>
                              {slot.assignment.coordinator.phone}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Lisamaterjalid */}
              <div className={classes.divider} />
              <div className={classes.sectionRow}>
                <div className={classes.sectionLabel}>
                  <AttachIcon className={classes.sectionIcon} />
                  <span>{t('calendar.attachments')}</span>
                  {isTranslatorConfirmedView &&
                    slot?.assignment?.files?.length ? (
                      <button className={classes.sectionLinkBtn}>
                        {t('calendar.download_files', {
                          count: slot.assignment.files.length,
                        })}
                      </button>
                    ) : !isTranslatorConfirmedView ? null : (
                      <span className={classes.sectionNote}>
                        {t('calendar.available_after_confirmation')}
                      </span>
                    )}
                </div>
              </div>
              {(isChangingDuration || isPastSlot) && slot?.assignment?.files?.length ? (
                <div className={classes.fileList}>
                  <div className={classes.fileListHeader}>
                    {t('calendar.file_list_header')}
                  </div>
                  {slot.assignment.files.map((f, i) => (
                    <div key={i} className={classes.fileItem}>
                      <button className={classes.fileLink}>{f.name}</button>
                      <DownloadIcon className={classes.downloadIcon} />
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Kommentaarid */}
              <div className={classes.divider} />
              <div className={classes.sectionRow}>
                <div className={classes.sectionLabel}>
                  <ChevronLeft className={classes.sectionChevron} />
                  <span>{t('calendar.comments')}</span>
                  {isTranslatorConfirmedView &&
                    slot?.assignment?.last_comment_date && (
                      <span className={classes.sectionNote}>
                        {t('calendar.last_commented', {
                          date: slot.assignment.last_comment_date,
                        })}
                      </span>
                    )}
                </div>
                {isTranslatorConfirmedView && (
                  <button className={classes.sectionBtn}>
                    {t('calendar.add_short')}
                    <AddIcon style={{ width: 16, height: 16 }} />
                  </button>
                )}
              </div>
              {(isChangingDuration || isPastSlot) && slot?.assignment?.comments?.length ? (
                <>
                  {slot.assignment.comments.map((c, i) => (
                    <div key={i} className={classes.commentContent}>
                      <span className={classes.commentAuthor}>{c.author}</span>
                      <span className={classes.commentText}>{c.text}</span>
                      <span className={classes.commentDate}>
                        {t('calendar.added_at', {
                          date: dayjs(c.created_at).format(
                            'DD.MM.YYYY [kell] HH:mm'
                          ),
                        })}
                      </span>
                    </div>
                  ))}
                  <div className={classes.sectionRow}>
                    <div className={classes.sectionLabel} />
                    <button className={classes.sectionBtn}>
                      {t('calendar.add_short')}
                      <AddIcon style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                </>
              ) : null}

              {/* Tõlketeenuse maksumus */}
              {(isChangingDuration || isPastSlot) && (
                <>
                  <div className={classes.divider} />
                  <div className={classes.sectionRow}>
                    <div className={classes.sectionLabel}>
                      <ChevronLeft className={classes.sectionChevron} />
                      <span>{t('calendar.translation_cost')}</span>
                    </div>
                  </div>
                  <div className={classes.costContent}>
                    {slot?.assignment?.price_per_minute && (
                      <div className={classes.costGroup}>
                        <span className={classes.costLabel}>
                          {t('calendar.cost_per_minute')}
                        </span>
                        <div className={classes.inputReadonly}>
                          {slot.assignment.price_per_minute}
                        </div>
                      </div>
                    )}
                    {slot?.assignment?.billing_method && (
                      <div className={classes.costGroup}>
                        <span className={classes.costLabel}>
                          {t('calendar.billing_method')}
                        </span>
                        <div className={classes.inputReadonly}>
                          {slot.assignment.billing_method}
                        </div>
                      </div>
                    )}
                    {isChangingDuration && (
                      <div className={classes.costGroup}>
                        <span className={classes.costLabel}>
                          {t('calendar.add_note')}
                        </span>
                        <textarea
                          className={classes.textarea}
                          placeholder={t('calendar.write_text')}
                          value={durationNote}
                          onChange={(e) => setDurationNote(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className={classes.form}>
                {/* Tellija — TPM only, form mode */}
                {isTPM && isFormMode && (
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.client')}
                    </label>
                    <input
                      className={classes.input}
                      placeholder={t('calendar.enter_name')}
                      value={tellija}
                      onChange={(e) => setTellija(e.target.value)}
                    />
                  </div>
                )}

                {/* Viitenumber — form mode only */}
                {isFormMode && (
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.reference_number')}
                    </label>
                    <input
                      className={classes.input}
                      placeholder={t('calendar.enter_number')}
                      value={viitenumber}
                      onChange={(e) => setViitenumber(e.target.value)}
                    />
                  </div>
                )}

                {/* Keel */}
                <div className={classes.formGroup}>
                  <label className={classes.label}>
                    {t('calendar.language')}
                  </label>
                  <div className={classes.inputReadonly}>
                    {language?.language.name ?? ''}
                  </div>
                </div>

                {/* Kuupäev */}
                <div className={classes.formGroup}>
                  <label className={classes.label}>{t('calendar.date')}</label>
                  <div className={classes.inputReadonly}>{date}</div>
                </div>

                {/* Alates + Kestus */}
                <div className={classes.formRow}>
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.from')}
                    </label>
                    <div className={classes.inputReadonly}>{startTime}</div>
                  </div>
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.duration')}
                    </label>
                    <div className={classes.inputReadonly}>{duration}</div>
                  </div>
                </div>

                {/* Tellimuse tüüp — form mode only */}
                {isFormMode && (
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.order_type')}
                    </label>
                    <select
                      className={classes.select}
                      value={serviceType}
                      onChange={(e) => {
                        setServiceType(e.target.value as ServiceType)
                        setLocation('')
                      }}
                    >
                      <option value="" disabled>
                        {t('calendar.select_type')}
                      </option>
                      <option value="kaugtolge">
                        {t('calendar.service_type_remote')}
                      </option>
                      <option value="kontakttolge">
                        {t('calendar.service_type_contact')}
                      </option>
                    </select>
                  </div>
                )}

                {/* Asukoht / Koosoleku link — form mode only */}
                {isFormMode && serviceType === 'kontakttolge' && (
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.location')}
                    </label>
                    <input
                      className={classes.input}
                      placeholder={t('calendar.enter_address')}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                )}
                {isFormMode && serviceType === 'kaugtolge' && (
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.meeting_link')}
                    </label>
                    <input
                      className={classes.input}
                      placeholder={t('calendar.enter_link')}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                )}

                {/* Valdkond — form mode only */}
                {isFormMode && (
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.domain')}
                    </label>
                    <select
                      className={classes.select}
                      value={domainId}
                      onChange={(e) => setDomainId(e.target.value)}
                    >
                      <option value="">{t('calendar.select_domain')}</option>
                      {(domains ?? []).map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Teostaja — TPM only, form mode only */}
                {isTPM && isFormMode && (
                  <div className={classes.formGroup}>
                    <label className={classes.label}>
                      {t('calendar.translator')}
                    </label>
                    <select
                      className={classes.select}
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                    >
                      <option value="">
                        {t('calendar.select_translator')}
                      </option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.institution_user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Lisamaterjal */}
              <div className={classes.divider} />
              <div className={classes.sectionRow}>
                <div className={classes.sectionLabel}>
                  <AttachIcon className={classes.sectionIcon} />
                  <span>{t('calendar.attachments')}</span>
                </div>
                <button className={classes.sectionBtn}>
                  {t('calendar.add_attachment')}
                </button>
              </div>

              {/* Kommentaarid */}
              <div className={classes.divider} />
              <div className={classes.sectionRow}>
                <div className={classes.sectionLabel}>
                  <ChevronLeft className={classes.sectionChevron} />
                  <span>{t('calendar.comments')}</span>
                </div>
                <button className={classes.sectionBtn}>
                  {t('calendar.add_comment')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer — hidden for Teostaja view except in muuda kestus mode */}
        {(!isTranslatorView || isChangingDuration) && (
          <div className={classes.footer}>
            {isChangingDuration ? (
              <>
                <Button
                  appearance={AppearanceTypes.Primary}
                  onClick={handleSaveDuration}
                  disabled={isUpdating}
                >
                  {isUpdating
                    ? t('calendar.saving')
                    : t('calendar.save_duration')}
                </Button>
                <Button
                  appearance={AppearanceTypes.Secondary}
                  onClick={handleCancelChangeDuration}
                  disabled={isUpdating}
                >
                  {t('calendar.cancel_changes')}
                </Button>
              </>
            ) : isViewMode ? (
              isEditing ? (
                <>
                  <Button
                    appearance={AppearanceTypes.Primary}
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                  >
                    {isUpdating ? t('calendar.saving') : t('calendar.save')}
                  </Button>
                  <Button
                    appearance={AppearanceTypes.Secondary}
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    {t('calendar.cancel_changes')}
                  </Button>
                </>
              ) : isConfirmingCancel ? (
                <>
                  <Button
                    appearance={AppearanceTypes.Primary}
                    onClick={handleVoidConfirm}
                    disabled={isCancelling}
                  >
                    {isCancelling
                      ? t('calendar.voiding')
                      : t('calendar.void_confirm_yes')}
                  </Button>
                  <Button
                    appearance={AppearanceTypes.Secondary}
                    onClick={() => setIsConfirmingCancel(false)}
                    disabled={isCancelling}
                  >
                    {t('calendar.void_confirm_no')}
                  </Button>
                </>
              ) : (
                <>
                  {canEdit && (
                    <Button
                      appearance={AppearanceTypes.Primary}
                      onClick={handleStartEdit}
                    >
                      {t('calendar.edit')}
                    </Button>
                  )}
                  {isPastSlot && !canEdit ? (
                    <Button
                      appearance={AppearanceTypes.Secondary}
                      onClick={closeSidePanel}
                    >
                      {t('calendar.close')}
                    </Button>
                  ) : (
                    <Button
                      appearance={AppearanceTypes.Secondary}
                      onClick={() => setIsConfirmingCancel(true)}
                    >
                      {canEdit
                        ? t('calendar.void')
                        : t('calendar.cancel_order')}
                    </Button>
                  )}
                </>
              )
            ) : (
              <>
                <Button
                  appearance={AppearanceTypes.Primary}
                  onClick={handleSubmit}
                  disabled={isCreating || !serviceType}
                >
                  {isCreating
                    ? t('calendar.saving')
                    : t('calendar.create_order')}
                </Button>
                <Button
                  appearance={AppearanceTypes.Secondary}
                  onClick={closeSidePanel}
                >
                  {t('calendar.cancel')}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default CalendarOrderSidePanel
