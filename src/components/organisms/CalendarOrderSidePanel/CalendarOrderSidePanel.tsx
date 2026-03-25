import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { formatDuration } from 'helpers/calendar'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'
import {
  useCreateCalendarOrder,
  useUpdateCalendarOrder,
  useCancelCalendarOrder,
  useFetchSlotMatching,
  useCreatePrebook,
  useCancelPrebook,
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
import { SidePanelContext } from './SidePanelContext'
import classes from './classes.module.scss'
import { ServiceType } from 'types/calendar'

const CalendarOrderSidePanel: FC = () => {
  const { t } = useTranslation()
  const { sidePanelSelection, closeSidePanel } = useCalendarPanel()
  const { isTPM, isClient, isTranslator } = useCalendarRole()
  const navigate = useNavigate()
  const { mutate: createOrder, isPending: isCreating } =
    useCreateCalendarOrder()
  const { mutate: updateOrder, isPending: isUpdating } =
    useUpdateCalendarOrder()
  const { mutate: cancelOrder, isPending: isCancelling } =
    useCancelCalendarOrder()
  const { mutate: createPrebook } = useCreatePrebook()
  const { mutate: cancelPrebook } = useCancelPrebook()
  const prebookActiveRef = useRef(false)

  const [referenceNumber, setReferenceNumber] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('')
  const [location, setLocation] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [startTimeInput, setStartTimeInput] = useState('')
  const [clientInstitutionId, setClientInstitutionId] = useState('')
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
      setReferenceNumber('')
      setServiceType('')
      setLocation('')
      setSelectedDate('')
      setStartTimeInput('')
      setClientInstitutionId('')
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
        setReferenceNumber(a.reference_number ?? '')
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
  }, [sidePanelSelection])

  // Create prebook when opening a new (non-view) slot
  useEffect(() => {
    if (!isOpen || isViewMode || !language || !startIso || !endIso) return
    prebookActiveRef.current = true
    createPrebook({
      language_id: language.language.id,
      start_at: startIso,
      end_at: endIso,
    })
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => {
    if (prebookActiveRef.current) {
      cancelPrebook()
      prebookActiveRef.current = false
    }
    closeSidePanel()
  }, [cancelPrebook, closeSidePanel])

  const handleSubmit = () => {
    if (!language || !startIso || !serviceType) return
    const computedEndIso = dayjs(startIso)
      .add(durationMinutes, 'minute')
      .toISOString()
    createOrder(
      {
        language_id: language.language.id,
        start_at: startIso,
        end_at: computedEndIso,
        service_type: serviceType === 'kaugtolge' ? 'remote' : 'on-site',
        reference_number: referenceNumber || undefined,
        location: serviceType === 'kontakttolge' ? location : undefined,
        meeting_link: serviceType === 'kaugtolge' ? location : undefined,
        client_institution_id: isTPM
          ? clientInstitutionId || undefined
          : undefined,
        domain_id: domainId || undefined,
        vendor_id: isTPM ? vendorId || undefined : undefined,
      },
      {
        onSuccess: () => {
          prebookActiveRef.current = false
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
    setReferenceNumber(slot?.assignment?.reference_number ?? '')
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
    setSelectedDate(date)
    setStartTimeInput(startTime)
    setDurationMinutes(slotDurationMinutes)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setReferenceNumber('')
    setServiceType('')
    setLocation('')
    setSelectedDate('')
    setStartTimeInput('')
    setClientInstitutionId('')
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
        reference_number: referenceNumber || undefined,
        location: serviceType === 'kontakttolge' ? location : undefined,
        meeting_link: serviceType === 'kaugtolge' ? location : undefined,
        client_institution_id: isTPM
          ? clientInstitutionId || undefined
          : undefined,
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
        handleClose()
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_order_cancelled'),
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

  const contextValue = useMemo(
    () => ({
      language,
      slot,
      date,
      startTime,
      duration,
      isPastSlot,
      isViewMode,
      isTPM,
      referenceNumber,
      setReferenceNumber,
      serviceType,
      setServiceType,
      location,
      setLocation,
      selectedDate,
      setSelectedDate,
      startTimeInput,
      setStartTimeInput,
      clientInstitutionId,
      setClientInstitutionId,
      domainId,
      setDomainId,
      vendorId,
      setVendorId,
      durationMinutes,
      setDurationMinutes,
      durationNote,
      setDurationNote,
      isEditing,
      isConfirmingCancel,
      setIsConfirmingCancel,
      isMetaOpen,
      setIsMetaOpen,
      isChangingDuration,
      isCreating,
      isUpdating,
      isCancelling,
      domains,
      vendors: vendors ?? [],
      handleSubmit,
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit,
      handleVoidConfirm,
      handleStartChangeDuration,
      handleCancelChangeDuration,
      handleSaveDuration,
      closeSidePanel: handleClose,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      language, slot, date, startTime, duration, isPastSlot, isViewMode,
      isTPM,
      referenceNumber,
      serviceType,
      location,
      selectedDate,
      startTimeInput,
      clientInstitutionId,
      domainId,
      vendorId,
      durationMinutes,
      durationNote,
      isEditing, isConfirmingCancel, isMetaOpen, isChangingDuration,
      isCreating,
      isUpdating,
      isCancelling,
      domains, vendors,
      handleClose,
    ]
  )

  // Determine which footer to show
  const isTPMPastView = isTPM && isViewMode && isPastSlot
  const showFooter =
    (!isTranslatorView || isChangingDuration) &&
    !isClientPastView &&
    !isTPMPastView &&
    !(isClient && isViewMode)

  return (
    <>
      {isOpen && <div className={classes.backdrop} onClick={handleClose} />}
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
            <button className={classes.headerBtn} onClick={handleClose}>
              {t('calendar.close')}
              <CloseIcon className={classes.headerBtnIcon} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <SidePanelContext.Provider value={contextValue}>
          <div className={classes.body}>
            {isTranslatorView ? (
              <CalendarTranslatorBody />
            ) : isClientPastView || isTPMPastView ? (
              <CalendarClientPastBody />
            ) : isClient && isViewMode ? (
              <CalendarClientBody />
            ) : (
              <CalendarOrderFormBody />
            )}
          </div>
        </SidePanelContext.Provider>

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
                      onClick={handleClose}
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
                  onClick={handleClose}
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
