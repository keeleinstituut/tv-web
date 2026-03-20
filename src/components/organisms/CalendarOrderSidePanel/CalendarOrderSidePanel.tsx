import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { formatDuration } from 'helpers/calendar'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'
import {
  useCreateCalendarOrder,
  useUpdateCalendarOrder,
  useCancelCalendarOrder,
  useConfirmCalendarOrder,
  useRejectCalendarOrder,
  useFetchSlotMatching,
} from 'hooks/requests/useCalendar'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import CloseIcon from 'assets/icons/close.svg?react'
import OpenBookingIcon from 'assets/icons/open_booking.svg?react'
import CalendarTranslatorBody from './CalendarTranslatorBody'
import CalendarClientPastBody from './CalendarClientPastBody'
import CalendarClientBody from './CalendarClientBody'
import CalendarOrderFormBody from './CalendarOrderFormBody'
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
  const { mutate: confirmOrder, isPending: isConfirming } =
    useConfirmCalendarOrder()
  const { mutate: rejectOrder, isPending: isRejecting } =
    useRejectCalendarOrder()

  const [viitenumber, setViitenumber] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('')
  const [location, setLocation] = useState('')
  const [kuupaev, setKuupaev] = useState('')
  const [algusaeg, setAlgusaeg] = useState('')
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
  const isTranslatorView = isTranslator && isViewMode
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

  const projectId = slot?.assignment?.sub_project?.id
  const canEdit = isTPM || isClient
  const isPastSlot = slot ? dayjs(slot.end_at).isBefore(dayjs()) : false
  const isClientPastView = isClient && isViewMode && isPastSlot
  const isTPMPendingView =
    isTPM && isViewMode && slot?.assignment?.status === 'pending'

  // Slot matching for TPM — only fetch in form mode
  const slotMatchingParams =
    isFormMode && isTPM && startIso && endIso && language
      ? {
          start_at: startIso,
          end_at: endIso,
          language_id: language.language.id,
        }
      : null
  const { vendors } = useFetchSlotMatching(slotMatchingParams)

  // Domains for Valdkond
  const { classifierValues: domains } = useClassifierValuesFetch(
    isFormMode ? { type: ClassifierValueType.TranslationDomain } : undefined
  )

  // Reset state when panel opens/closes
  useEffect(() => {
    if (!isOpen) {
      setViitenumber('')
      setServiceType('')
      setLocation('')
      setKuupaev('')
      setAlgusaeg('')
      setTellija('')
      setDomainId('')
      setVendorId('')
      setIsEditing(false)
      setIsConfirmingCancel(false)
      setIsMetaOpen(false)
      setIsChangingDuration(false)
      setDurationMinutes(60)
      setDurationNote('')
    } else {
      // Pre-fill vendor when opening from a vendor row
      if (sidePanelSelection?.vendorId) {
        setVendorId(sidePanelSelection.vendorId)
      }
      // Initialise duration stepper from the drag selection
      if (!isViewMode) {
        setDurationMinutes(slotDurationMinutes)
      }
      // Pre-fill form for TPM pending order view
      if (isTPM && sidePanelSelection?.slot?.assignment?.status === 'pending') {
        const a = sidePanelSelection.slot.assignment
        setViitenumber(a.reference_number ?? '')
        setServiceType(
          a.service_type === 'remote'
            ? 'kaugtolge'
            : a.service_type === 'on-site'
              ? 'kontakttolge'
              : ''
        )
        setLocation(a.meeting_link ?? a.location ?? '')
      }
    }
    if (isOpen && isClientPastView) {
      setIsMetaOpen(true)
    }
  }, [isOpen])

  const handleSubmit = () => {
    if (!language || !startIso) return
    const computedEndIso = dayjs(startIso)
      .add(durationMinutes, 'minute')
      .toISOString()
    createOrder(
      {
        language_id: language.language.id,
        start_at: startIso,
        end_at: computedEndIso,
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
    setViitenumber(slot?.assignment?.reference_number ?? '')
    setServiceType(
      slot?.assignment?.service_type === 'remote'
        ? 'kaugtolge'
        : slot?.assignment?.service_type === 'on-site'
          ? 'kontakttolge'
          : ''
    )
    setLocation(
      slot?.assignment?.meeting_link ?? slot?.assignment?.location ?? ''
    )
    setKuupaev(date)
    setAlgusaeg(startTime)
    setDurationMinutes(slotDurationMinutes)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setViitenumber('')
    setServiceType('')
    setLocation('')
    setKuupaev('')
    setAlgusaeg('')
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

  const handleConfirmOrder = () => {
    if (!projectId) return
    confirmOrder(projectId, {
      onSuccess: () => {
        closeSidePanel()
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_order_confirmed'),
        })
      },
    })
  }

  const handleRejectOrder = () => {
    if (!projectId) return
    rejectOrder(projectId, {
      onSuccess: () => {
        closeSidePanel()
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_order_rejected'),
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

  // Determine which footer to show
  const isTPMPastView = isTPM && isViewMode && isPastSlot
  const showFooter =
    (!isTranslatorView || isChangingDuration) &&
    !isClientPastView &&
    !isTPMPastView &&
    !isTPMPendingView &&
    !(isClient && isViewMode)

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
                <OpenBookingIcon className={classes.headerBtnIcon} />
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
            <CalendarTranslatorBody
              language={language}
              slot={slot}
              date={date}
              startTime={startTime}
              duration={duration}
              isPastSlot={isPastSlot}
              isChangingDuration={isChangingDuration}
              isConfirmingCancel={isConfirmingCancel}
              isMetaOpen={isMetaOpen}
              durationMinutes={durationMinutes}
              durationNote={durationNote}
              isCancelling={isCancelling}
              isUpdating={isUpdating}
              onVoidConfirm={handleVoidConfirm}
              onSetIsConfirmingCancel={setIsConfirmingCancel}
              onStartChangeDuration={handleStartChangeDuration}
              onSetIsMetaOpen={setIsMetaOpen}
              onSetDurationMinutes={setDurationMinutes}
              onSetDurationNote={setDurationNote}
            />
          ) : isClientPastView || isTPMPastView ? (
            <CalendarClientPastBody
              language={language}
              slot={slot}
              date={date}
              startTime={startTime}
              duration={duration}
              isMetaOpen={isMetaOpen}
              onSetIsMetaOpen={setIsMetaOpen}
            />
          ) : isClient && isViewMode ? (
            <CalendarClientBody
              language={language}
              slot={slot}
              date={date}
              startTime={startTime}
              duration={duration}
              isPastSlot={isPastSlot}
              isEditing={isEditing}
              isConfirmingCancel={isConfirmingCancel}
              isMetaOpen={isMetaOpen}
              durationMinutes={durationMinutes}
              viitenumber={viitenumber}
              serviceType={serviceType}
              location={location}
              kuupaev={kuupaev}
              algusaeg={algusaeg}
              domainId={domainId}
              domains={domains}
              isUpdating={isUpdating}
              isCancelling={isCancelling}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onVoidConfirm={handleVoidConfirm}
              onSetIsConfirmingCancel={setIsConfirmingCancel}
              onSetIsMetaOpen={setIsMetaOpen}
              onSetViitenumber={setViitenumber}
              onSetServiceType={setServiceType}
              onSetLocation={setLocation}
              onSetKuupaev={setKuupaev}
              onSetAlgusaeg={setAlgusaeg}
              onSetDomainId={setDomainId}
              onSetDurationMinutes={setDurationMinutes}
            />
          ) : (
            <CalendarOrderFormBody
              language={language}
              slot={slot}
              isViewMode={isViewMode}
              isTPMPendingView={isTPMPendingView}
              isConfirming={isConfirming}
              isRejecting={isRejecting}
              onConfirmOrder={handleConfirmOrder}
              onRejectOrder={handleRejectOrder}
              date={date}
              startTime={startTime}
              duration={duration}
              isTPM={isTPM}
              viitenumber={viitenumber}
              serviceType={serviceType}
              location={location}
              tellija={tellija}
              domainId={domainId}
              vendorId={vendorId}
              durationMinutes={durationMinutes}
              domains={domains}
              vendors={vendors}
              onSetDurationMinutes={setDurationMinutes}
              onSetViitenumber={setViitenumber}
              onSetServiceType={setServiceType}
              onSetLocation={setLocation}
              onSetTellija={setTellija}
              onSetDomainId={setDomainId}
              onSetVendorId={setVendorId}
            />
          )}
        </div>

        {/* Footer — hidden for Teostaja (except muuda kestus), Client past, and Client non-past view */}
        {showFooter && (
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
                  {canEdit && !isPastSlot && (
                    <Button
                      appearance={AppearanceTypes.Primary}
                      onClick={handleStartEdit}
                    >
                      {t('calendar.edit')}
                    </Button>
                  )}
                  {isPastSlot ? (
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
                  disabled={isCreating || !serviceType || !location.trim()}
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
