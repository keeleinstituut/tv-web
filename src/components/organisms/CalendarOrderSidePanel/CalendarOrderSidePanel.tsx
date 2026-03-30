import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  apiServiceTypeToForm,
  areSortedIdArraysEqual,
  formatDuration,
} from 'helpers/calendar'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { useAuth } from 'components/contexts/AuthContext'
import {
  useCreateCalendarOrder,
  useUpdateCalendarOrder,
  useCancelCalendarOrder,
  useFetchSlotMatching,
  useCreatePrebook,
  useCancelPrebook,
  useFetchCalendarOrderDetail,
  useCalendarAddFiles,
  useCalendarDeleteFile,
  useCalendarDownloadFile,
  useDeclineCancelCalendarOrder,
  useAddCalendarOrderComment,
} from 'hooks/requests/useCalendar'
import { useFetchCalendarTags } from 'hooks/requests/useCalendar'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import CloseIcon from 'assets/icons/close.svg?react'
import OpenBookingIcon from 'assets/icons/open_booking.svg?react'
import CalendarTranslatorBody from './CalendarTranslatorBody'
import CalendarOrderPastBody from './CalendarOrderPastBody'
import CalendarOrderViewBody from './CalendarOrderViewBody'
import CalendarOrderFormBody from './CalendarOrderFormBody'
import { SidePanelContext } from './SidePanelContext'
import classes from './classes.module.scss'
import { ServiceType, UpdateOrderPayload } from 'types/calendar'

const CalendarOrderSidePanel: FC = () => {
  const { t } = useTranslation()
  const { sidePanelSelection, closeSidePanel } = useCalendarPanel()
  const { isTPM, isClient, isTranslator } = useCalendarRole()
  const navigate = useNavigate()
  const { institutionUserId } = useAuth()
  const { mutate: createOrder, isPending: isCreating } =
    useCreateCalendarOrder()
  const { mutate: updateOrder, isPending: isUpdating } =
    useUpdateCalendarOrder()
  const { mutate: cancelOrder, isPending: isCancelling } =
    useCancelCalendarOrder()
  const { mutate: declineCancelOrder, isPending: isDecliningCancel } =
    useDeclineCancelCalendarOrder()
  const { mutate: createPrebook } = useCreatePrebook()
  const { mutate: cancelPrebook } = useCancelPrebook()
  const prebookActiveRef = useRef(false)
  const editBaselineRef = useRef<{
    serviceType: ServiceType
    referenceNumber: string
    location: string
    clientInstitutionId: string
    domainIds: string[]
    vendorId: string
  } | null>(null)

  const [referenceNumber, setReferenceNumber] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('')
  const [location, setLocation] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [startTimeInput, setStartTimeInput] = useState('')
  const [clientInstitutionId, setClientInstitutionId] = useState('')
  const [domainIds, setDomainIds] = useState<string[]>([])
  const [vendorId, setVendorId] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelled, setIsCancelled] = useState(false)
  const [isCancelPending, setIsCancelPending] = useState(false)
  const [cancelCountdown, setCancelCountdown] = useState(30)
  const [isMetaOpen, setIsMetaOpen] = useState(false)
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pendingComment, setPendingComment] = useState('')

  const isOpen = sidePanelSelection !== null
  const isViewMode = !!sidePanelSelection?.slot
  const isTranslatorView = isTranslator && isViewMode && !isTPM
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

  const { order } = useFetchCalendarOrderDetail(projectId ?? null)
  const { mutate: addFilesMutate, isPending: isAddingFiles } =
    useCalendarAddFiles(projectId)
  const { mutate: deleteFileMutate, isPending: isDeletingFile } =
    useCalendarDeleteFile(projectId)
  const { mutate: downloadFileMutate } = useCalendarDownloadFile({ projectId })
  const { mutate: addComment, isPending: isPostingComment } =
    useAddCalendarOrderComment(projectId)

  const isOwner =
    !isClient || order?.client_institution_user?.id === institutionUserId
  const canEdit = isTPM || (isClient && isOwner)
  const isRequiredFilled =
    !!referenceNumber.trim() &&
    !!serviceType &&
    !!location.trim() &&
    (!isTPM || !!clientInstitutionId) &&
    (!isTPM || !!vendorId)
  const assignmentStatus = slot?.assignment?.status
  // Assignment ACCEPTED is workflow (vendor took the task), not project complete — teostaja
  // may still change duration until the order is ACCEPTED/CANCELLED at project level.
  const assignmentWorkEnded =
    assignmentStatus === 'DONE' || assignmentStatus === 'CANCELLED'
  const orderTerminal =
    order?.status === 'ACCEPTED' || order?.status === 'CANCELLED'
  const isPastSlot = isCancelled || assignmentWorkEnded || orderTerminal
  const isClientPastView = isClient && isViewMode && isPastSlot

  // Slot matching for TPM — only fetch in form mode
  const vendorLocked = !!sidePanelSelection?.vendorId
  const slotMatchingParams =
    isFormMode && isTPM && !vendorLocked && startIso && endIso && language
      ? {
          start_at: startIso,
          end_at: endIso,
          language_id: language.language.id,
        }
      : null
  const { vendors: fetchedVendors } = useFetchSlotMatching(slotMatchingParams)
  const vendors =
    vendorLocked && sidePanelSelection?.vendorId
      ? [
          {
            id: sidePanelSelection.vendorId,
            name: sidePanelSelection.vendorName ?? null,
            institution_user_id: '',
            is_internal: true,
          },
        ]
      : fetchedVendors

  // Domains for Valdkond
  const { tags: domains } = useFetchCalendarTags()

  // Reset state when panel opens/closes
  useEffect(() => {
    if (!isOpen) {
      setReferenceNumber('')
      setServiceType('')
      setLocation('')
      setPendingFiles([])
      setPendingComment('')
      setSelectedDate('')
      setStartTimeInput('')
      setClientInstitutionId('')
      setDomainIds([])
      setVendorId('')
      setIsEditing(false)
      setIsConfirmingCancel(false)
      setCancelReason('')
      setIsCancelled(false)
      setIsCancelPending(false)
      setCancelCountdown(30)
      setIsMetaOpen(false)
      setDurationMinutes(60)
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
      if (isTPM && sidePanelSelection?.slot?.assignment?.status === 'NEW') {
        const a = sidePanelSelection.slot.assignment
        setReferenceNumber(a.reference_number ?? '')
        setServiceType(apiServiceTypeToForm(a.service_type))
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
    createPrebook(
      {
        language_id: language.language.id,
        start_at: startIso,
        end_at: endIso,
        ...(sidePanelSelection?.vendorId
          ? { vendor_id: sidePanelSelection.vendorId }
          : {}),
      },
      {
        onSuccess: () => {
          // Panel closed before prebook resolved — cancel the orphaned prebook
          if (!prebookActiveRef.current) {
            cancelPrebook()
          }
        },
        onError: (err: unknown) => {
          prebookActiveRef.current = false
          const msg = (err as { message?: string })?.message ?? ''
          if (msg.toLowerCase().includes('only one prebook')) {
            showNotification({
              type: NotificationTypes.Error,
              title: t('notification.error'),
              content: t('calendar.prebook_limit'),
            })
          }
        },
      }
    )
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isCancelPending) return
    if (cancelCountdown <= 0) {
      setIsCancelPending(false)
      return
    }
    const timer = setTimeout(() => setCancelCountdown((v) => v - 1), 1000)
    return () => clearTimeout(timer)
  }, [isCancelPending, cancelCountdown])

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
        service_type: serviceType === 'kaugtolge' ? 'REMOTE' : 'ON_SITE',
        reference_number: referenceNumber || undefined,
        location: serviceType === 'kontakttolge' ? location : undefined,
        meeting_link: serviceType === 'kaugtolge' ? location : undefined,
        client_institution_id: isTPM
          ? clientInstitutionId || undefined
          : undefined,
        tag_ids: domainIds.length ? domainIds : undefined,
        vendor_id: isTPM ? vendorId || undefined : undefined,
        comment: pendingComment || undefined,
        help_files: pendingFiles.length ? pendingFiles : undefined,
      },
      {
        onSuccess: () => {
          setPendingFiles([])
          setPendingComment('')
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
    setPendingComment('')
    setIsConfirmingCancel(false)
    const st = slot?.assignment?.service_type
    const initServiceType = apiServiceTypeToForm(st)
    const initLocation =
      slot?.assignment?.location ?? order?.meeting_link ?? order?.location ?? ''
    const initReferenceNumber = slot?.assignment?.reference_number ?? ''
    const initClientInstitutionId = order?.client_institution_user?.id ?? ''
    const initDomainIds = order?.tags?.map((t) => t.id) ?? []
    const initVendorId = vendorId

    setReferenceNumber(initReferenceNumber)
    setServiceType(initServiceType)
    setLocation(initLocation)
    setSelectedDate(date)
    setStartTimeInput(startTime)
    setDurationMinutes(slotDurationMinutes)
    setDomainIds(initDomainIds)
    setClientInstitutionId(initClientInstitutionId)

    editBaselineRef.current = {
      serviceType: initServiceType,
      referenceNumber: initReferenceNumber,
      location: initLocation,
      clientInstitutionId: initClientInstitutionId,
      domainIds: initDomainIds,
      vendorId: initVendorId,
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setReferenceNumber('')
    setServiceType('')
    setLocation('')
    setSelectedDate('')
    setStartTimeInput('')
    setClientInstitutionId('')
    setDomainIds([])
    setVendorId('')
    editBaselineRef.current = null
  }

  const handleSaveEdit = () => {
    if (!projectId) return
    const b = editBaselineRef.current

    const payload: UpdateOrderPayload = { id: projectId }

    if (!b || serviceType !== b.serviceType) {
      payload.service_type =
        serviceType === 'kaugtolge'
          ? 'REMOTE'
          : serviceType === 'kontakttolge'
            ? 'ON_SITE'
            : undefined
    }
    if (!b || referenceNumber !== b.referenceNumber) {
      payload.reference_number = referenceNumber || undefined
    }
    if (!b || location !== b.location || serviceType !== b.serviceType) {
      payload.location =
        serviceType === 'kontakttolge' ? location || undefined : undefined
      payload.meeting_link =
        serviceType === 'kaugtolge' ? location || undefined : undefined
    }
    if (isTPM && (!b || clientInstitutionId !== b.clientInstitutionId)) {
      payload.client_institution_id = clientInstitutionId || undefined
    }
    if (!b || !areSortedIdArraysEqual(domainIds, b.domainIds)) {
      payload.tag_ids = domainIds.length ? domainIds : undefined
    }
    if (isTPM && !vendorLocked && (!b || vendorId !== b.vendorId)) {
      payload.vendor_id = vendorId || undefined
    }

    updateOrder(payload, {
      onSuccess: () => {
        setIsEditing(false)
        editBaselineRef.current = null
      },
      onError: (err: unknown) => {
        const msg = (err as { message?: string })?.message ?? ''
        if (msg.toLowerCase().includes('vendor is not available')) {
          showNotification({
            type: NotificationTypes.Error,
            title: t('notification.error'),
            content: t('calendar.vendor_not_available'),
          })
        }
      },
    })
  }

  const handleVoidConfirm = () => {
    if (!projectId || !cancelReason.trim()) return
    cancelOrder(
      {
        id: projectId,
        cancellation_reason: cancelReason.trim(),
        is_delayed: true,
      },
      {
        onSuccess: () => {
          setCancelReason('')
          setIsConfirmingCancel(false)
          setIsCancelled(true)
          setIsCancelPending(true)
          setCancelCountdown(30)
        },
      }
    )
  }

  const handleUndoCancel = useCallback(() => {
    if (!projectId) return
    declineCancelOrder(projectId, {
      onSuccess: () => {
        setIsCancelled(false)
        setIsCancelPending(false)
        setCancelCountdown(30)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_cancel_declined'),
        })
      },
    })
  }, [projectId, declineCancelOrder, t])

  const handleDeclineCancel = useCallback(() => {
    if (!projectId) return
    declineCancelOrder(projectId, {
      onSuccess: () => {
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_cancel_declined'),
        })
      },
    })
  }, [projectId, declineCancelOrder, t])

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
      domainIds,
      setDomainIds,
      vendorId,
      vendorLocked,
      setVendorId,
      durationMinutes,
      setDurationMinutes,
      isEditing,
      isConfirmingCancel,
      setIsConfirmingCancel,
      cancelReason,
      setCancelReason,
      isCancelled,
      isCancelPending,
      cancelCountdown,
      isMetaOpen,
      setIsMetaOpen,
      vendorName: sidePanelSelection?.vendorName,
      isCreating,
      isUpdating,
      isCancelling,
      domains,
      isRequiredFilled,
      vendors: vendors ?? [],
      order: order ?? null,
      addFiles: (files: File[]) => addFilesMutate(files),
      deleteFile: (arg: {
        id: string
        collection?: 'help' | 'source' | 'final'
      }) => deleteFileMutate(arg),
      downloadFile: (file: {
        id: string
        file_name: string
        collection?: 'help' | 'source' | 'final'
      }) => downloadFileMutate(file),
      isAddingFiles,
      isDeletingFile,
      pendingFiles,
      setPendingFiles,
      pendingComment,
      setPendingComment,
      addComment,
      isPostingComment,
      handleSubmit,
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit,
      handleVoidConfirm,
      handleUndoCancel,
      handleDeclineCancel,
      isDecliningCancel,
      closeSidePanel: handleClose,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      language,
      slot,
      date,
      startTime,
      duration,
      isPastSlot,
      isViewMode,
      isTPM,
      referenceNumber,
      serviceType,
      location,
      selectedDate,
      startTimeInput,
      clientInstitutionId,
      domainIds,
      vendorId,
      durationMinutes,
      isEditing,
      isConfirmingCancel,
      cancelReason,
      isCancelled,
      isCancelPending,
      cancelCountdown,
      isMetaOpen,
      isRequiredFilled,
      isCreating,
      isUpdating,
      isCancelling,
      isDecliningCancel,
      domains,
      vendors,
      order,
      isAddingFiles,
      isDeletingFile,
      pendingFiles,
      pendingComment,
      isPostingComment,
      sidePanelSelection?.vendorName,
      handleClose,
    ]
  )

  // Determine which footer to show
  const isTPMViewMode = isTPM && isViewMode
  const isTPMPastView = isTPM && isViewMode && isPastSlot
  const showFooter =
    !isTranslatorView &&
    !isClientPastView &&
    !isTPMPastView &&
    !isTPMViewMode &&
    !(isClient && isViewMode)

  return (
    <>
      {isOpen && <div className={classes.backdrop} onClick={handleClose} />}
      <div className={`${classes.panel} ${isOpen ? classes.open : ''}`}>
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.headerTitle}>
            {isViewMode
              ? t('calendar.order') +
                ' ' +
                (slot?.assignment?.sub_project.ext_id ?? t('calendar.order'))
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
              <CalendarOrderPastBody />
            ) : isViewMode ? (
              <CalendarOrderViewBody />
            ) : (
              <CalendarOrderFormBody />
            )}
          </div>
        </SidePanelContext.Provider>

        {/* Footer — hidden for Teostaja, Client past, and Client non-past view */}
        {showFooter && (
          <div className={classes.footer}>
            {isViewMode ? (
              isCancelPending ? (
                <>
                  <span className={classes.cancelPendingText}>
                    {cancelCountdown}s
                  </span>
                  <Button
                    appearance={AppearanceTypes.Secondary}
                    onClick={handleUndoCancel}
                    disabled={isDecliningCancel}
                  >
                    {t('calendar.undo_cancel')}
                  </Button>
                </>
              ) : isEditing ? (
                <>
                  <Button
                    appearance={AppearanceTypes.Primary}
                    onClick={handleSaveEdit}
                    disabled={isUpdating || !isRequiredFilled}
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
                  disabled={isCreating || !isRequiredFilled}
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
