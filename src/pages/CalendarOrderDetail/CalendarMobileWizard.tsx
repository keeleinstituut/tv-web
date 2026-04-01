import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import dayjs from 'dayjs'
import MultiSelect from 'components/molecules/MultiSelect/MultiSelect'
import CalendarSelect from 'components/molecules/CalendarSelect/CalendarSelect'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import {
  useCalendarDownloadFile,
  useCalendarDeleteFile,
  useUpdateCalendarOrderComment,
} from 'hooks/requests/useCalendar'
import { useFetchInfiniteProjectPerson } from 'hooks/requests/useUsers'
import { useAuth } from 'components/contexts/AuthContext'
import EditIcon from 'assets/icons/edit.svg?react'
import CalendarTimeSelect from 'components/molecules/CalendarTimeSelect/CalendarTimeSelect'
import { openNativeDateTimePicker } from 'helpers/nativeDateTimeInput'
import { useOrderDetail } from './OrderDetailContext'
import {
  CALENDAR_MOBILE_DURATION_OPTIONS as DURATION_OPTIONS,
  CALENDAR_MOBILE_WIZARD_TOTAL_STEPS as TOTAL_STEPS,
} from './calendarMobileWizardConstants'
import {
  CalendarMobileWizardCancelConfirmScreen,
  CalendarMobileWizardCancelPendingScreen,
} from './CalendarMobileWizardCancelScreens'
import classes from './mobile.module.scss'

const CalendarMobileWizard: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    order,
    isCreateMode,
    isTPM,
    isClient,
    canModify,
    isPast,
    statusLabel,
    durationLabel,
    fmt,
    languages,
    vendors,
    domains,
    sourceLanguageId,
    setSourceLanguageId,
    sourceLanguageOptions,
    languageId,
    setLanguageId,
    selectedDate,
    setSelectedDate,
    startTimeInput,
    setStartTimeInput,
    durationMinutes,
    setDurationMinutes,
    serviceType,
    setServiceType,
    address,
    setAddress,
    clientInstitutionId,
    setClientInstitutionId,
    referenceNumber,
    setReferenceNumber,
    domainIds,
    setDomainIds,
    vendorId,
    setVendorId,
    localFiles,
    setLocalFiles,
    fileInputRef,
    isEditing,
    setIsEditing,
    isConfirmingCancel,
    setIsConfirmingCancel,
    cancelReason,
    setCancelReason,
    isCancelPending,
    cancelCountdown,
    canSaveEdits,
    canCreateOrder,
    startIso,
    endIso,
    handleCreate,
    handleSave,
    handleCancelOrder,
    handleUndoCancel,
    resetFields,
    isCreating,
    isUpdating,
    isCancelling,
    isRefetchingOrder,
    showScheduledCancelBanner,
  } = useOrderDetail()

  const { institutionUserId } = useAuth()

  const [step, setStep] = useState(1)
  const [commentText, setCommentText] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  const { mutate: updateComment, isPending: isUpdatingComment } =
    useUpdateCalendarOrderComment(isCreateMode ? null : order?.id)

  const { mutate: downloadFile } = useCalendarDownloadFile({
    projectId: order?.id,
  })
  const { mutate: deleteFile } = useCalendarDeleteFile(order?.id)
  const { users: clients } = useFetchInfiniteProjectPerson(
    undefined,
    'client',
    isTPM
  )

  useEffect(() => {
    if (!isEditing || isCreateMode) return
    setAddingComment(false)
    setCommentText('')
  }, [isEditing, isCreateMode])

  // ─── Cancel pending screen ────────────────────────────────────────────────

  if (isCancelPending) {
    return (
      <CalendarMobileWizardCancelPendingScreen
        cancelCountdown={cancelCountdown}
        onUndoCancel={handleUndoCancel}
        isRefetchingOrder={isRefetchingOrder}
      />
    )
  }

  if (isConfirmingCancel) {
    return (
      <CalendarMobileWizardCancelConfirmScreen
        cancelReason={cancelReason}
        onCancelReasonChange={setCancelReason}
        isCancelling={isCancelling}
        onConfirmCancel={handleCancelOrder}
        onDismiss={() => {
          setIsConfirmingCancel(false)
          setCancelReason('')
        }}
        isRefetchingOrder={isRefetchingOrder}
      />
    )
  }

  // ─── Create wizard ────────────────────────────────────────────────────────

  if (isCreateMode) {
    const step1Valid =
      !!sourceLanguageId &&
      !!selectedDate &&
      !!startTimeInput &&
      !!languageId &&
      referenceNumber.trim().length > 0 &&
      (!isTPM || (!!clientInstitutionId && !!vendorId))
    const isLastStep = step === TOTAL_STEPS

    const renderProgress = () => (
      <div className={classes.progress}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`${classes.progressSegment} ${i < step ? classes.progressSegmentFilled : ''}`}
          />
        ))}
      </div>
    )

    const STEP_TITLES = [
      t('calendar.step_basic_info'),
      t('calendar.order_details_title'),
      t('calendar.comments'),
      t('calendar.files_and_links'),
    ]

    const renderStep1 = () => (
      <div className={classes.stepContent}>
        <p className={classes.requiredNotice}>
          {t('calendar.required_notice')}
        </p>

        {isTPM && (
          <div className={classes.field}>
            <label className={classes.fieldLabel}>{t('calendar.client')}</label>
            <CalendarSelect
              value={clientInstitutionId}
              onChange={setClientInstitutionId}
              options={clients.map((c) => ({
                value: c.id,
                label: [c.user.forename, c.user.surname]
                  .filter(Boolean)
                  .join(' '),
              }))}
              placeholder={t('calendar.select_client')}
            />
          </div>
        )}

        <div className={classes.field}>
          <label className={classes.fieldLabel}>
            {t('calendar.reference_number')}
          </label>
          <input
            className={classes.fieldInput}
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder={t('calendar.enter_number')}
          />
        </div>

        <div className={classes.field}>
          <label className={classes.fieldLabel}>
            {t('calendar.source_language')} *
          </label>
          <CalendarSelect
            value={sourceLanguageId}
            onChange={setSourceLanguageId}
            options={sourceLanguageOptions}
            placeholder={t('calendar.select_source_language')}
          />
        </div>

        <div className={classes.field}>
          <label className={classes.fieldLabel}>
            {t('calendar.language')} {isCreateMode ? '*' : ''}
          </label>
          {isCreateMode ? (
            <CalendarSelect
              value={languageId}
              onChange={(v) => {
                setLanguageId(v)
                setVendorId('')
              }}
              options={languages.map((lang) => ({
                value: lang.language.id,
                label: lang.language.name,
              }))}
              placeholder={t('calendar.select_language')}
            />
          ) : (
            <span className={classes.fieldReadonly}>
              {order?.language?.name}
            </span>
          )}
        </div>

        <div className={classes.field}>
          <label className={classes.fieldLabel}>
            {t('calendar.date_and_start_time')} *
          </label>
          <div className={classes.timeRow}>
            <input
              type="date"
              className={classes.fieldInput}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onClick={openNativeDateTimePicker}
            />
            <CalendarTimeSelect
              className={classes.fieldSelect}
              value={startTimeInput}
              onChange={setStartTimeInput}
            />
          </div>
        </div>

        <div className={classes.field}>
          <label className={classes.fieldLabel}>
            {t('calendar.duration')} *
          </label>
          <CalendarSelect
            value={String(durationMinutes)}
            onChange={(v) => setDurationMinutes(Number(v))}
            options={DURATION_OPTIONS.map(({ value, label }) => ({
              value: String(value),
              label: t(label as never) as string,
            }))}
          />
        </div>

        {isTPM && (
          <div className={classes.field}>
            <label className={classes.fieldLabel}>
              {t('calendar.translator')} *
            </label>
            <CalendarSelect
              value={vendorId}
              onChange={setVendorId}
              options={vendors.map((v) => ({
                value: v.id,
                label: v.name ?? '',
              }))}
              placeholder={t('calendar.select_translator')}
            />
          </div>
        )}
      </div>
    )

    const renderStep2 = () => (
      <div className={classes.stepContent}>
        <p className={classes.requiredNotice}>
          {t('calendar.required_notice')}
        </p>

        <div className={classes.field}>
          <label className={classes.fieldLabel}>
            {t('calendar.order_way')} *
          </label>
          <div className={classes.serviceToggle}>
            <button
              type="button"
              className={`${classes.serviceOption} ${serviceType === 'ON_SITE' ? classes.serviceOptionActive : ''}`}
              onClick={() => {
                setServiceType('ON_SITE')
                setAddress('')
              }}
            >
              {t('calendar.service_type_contact')}
            </button>
            <button
              type="button"
              className={`${classes.serviceOption} ${serviceType === 'REMOTE' ? classes.serviceOptionActive : ''}`}
              onClick={() => {
                setServiceType('REMOTE')
                setAddress('')
              }}
            >
              {t('calendar.service_type_remote')}
            </button>
          </div>
        </div>

        <div className={classes.field}>
          <label className={classes.fieldLabel}>
            {serviceType === 'ON_SITE'
              ? t('calendar.location')
              : t('calendar.meeting_link')}{' '}
            *
          </label>
          <input
            className={classes.fieldInput}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={
              serviceType === 'ON_SITE'
                ? t('calendar.enter_address')
                : t('calendar.enter_link')
            }
          />
        </div>

        <div className={classes.field}>
          <label className={classes.fieldLabel}>{t('calendar.domain')}</label>
          <MultiSelect
            options={domains ?? []}
            value={domainIds}
            onChange={setDomainIds}
            placeholder={t('calendar.select_domain')}
          />
        </div>
      </div>
    )

    const renderStep3 = () => (
      <div className={classes.stepContent}>
        {addingComment ? (
          <>
            <textarea
              className={classes.commentTextarea}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t('calendar.write_text')}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                appearance={AppearanceTypes.Primary}
                disabled={!commentText.trim()}
                onClick={() => setAddingComment(false)}
              >
                {t('calendar.save')}
              </Button>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => {
                  setAddingComment(false)
                  setCommentText('')
                }}
              >
                {t('calendar.cancel')}
              </Button>
            </div>
          </>
        ) : (
          <>
            {commentText && (
              <div className={classes.comment}>
                <span className={classes.commentText}>{commentText}</span>
              </div>
            )}
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={() => setAddingComment(true)}
            >
              {t('calendar.add_comment_btn')}
            </Button>
          </>
        )}
      </div>
    )

    const renderStep4 = () => (
      <div className={classes.stepContent}>
        <input
          ref={fileInputRef as React.RefObject<HTMLInputElement>}
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setLocalFiles((prev) => [...prev, file])
            e.target.value = ''
          }}
        />
        {isEditing && (order?.source_files?.length ?? 0) > 0 && (
          <div className={classes.fileTable}>
            <div className={classes.fileTableHeader}>
              <span>{t('calendar.file_list_header')}</span>
            </div>
            {order!.source_files!.map((file) => (
              <div key={file.id} className={classes.fileRow}>
                <span className={classes.fileRowName}>
                  {file.name || file.file_name}
                </span>
                <div className={classes.fileRowMeta}>
                  <div className={classes.fileActions}>
                    <button
                      className={classes.fileIconBtn}
                      onClick={() =>
                        deleteFile({
                          id: file.id,
                          collection: file.collection_name ?? 'help',
                        })
                      }
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {localFiles.length === 0 &&
          (order?.source_files?.length ?? 0) === 0 && (
            <p className={classes.emptyFiles}>{t('calendar.no_files_msg')}</p>
          )}
        {localFiles.length > 0 && (
          <div className={classes.fileTable}>
            {localFiles.map((f, i) => (
              <div key={i} className={classes.fileRow}>
                <span className={classes.fileRowName}>{f.name}</span>
                <div className={classes.fileRowMeta}>
                  <div className={classes.fileActions}>
                    <button
                      className={classes.fileIconBtn}
                      onClick={() =>
                        setLocalFiles((prev) => prev.filter((_, j) => j !== i))
                      }
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button
          appearance={AppearanceTypes.Secondary}
          onClick={() => fileInputRef.current?.click()}
        >
          {t('calendar.add_file')}
        </Button>
      </div>
    )

    const renderStepContent = () => {
      if (step === 1) return renderStep1()
      if (step === 2) return renderStep2()
      if (step === 3) return renderStep3()
      return renderStep4()
    }

    return (
      <div className={classes.wizard}>
        {renderProgress()}
        <div className={classes.stepHeader}>
          <div className={classes.stepCircle}>{step}</div>
          <h2 className={classes.stepTitle}>{STEP_TITLES[step - 1]}</h2>
        </div>
        {renderStepContent()}

        <div className={classes.footer}>
          {step > 1 ? (
            <Button
              appearance={AppearanceTypes.Secondary}
              className={classes.footerBtn}
              onClick={() => setStep((s) => s - 1)}
            >
              {t('calendar.back')}
            </Button>
          ) : isEditing ? (
            <Button
              appearance={AppearanceTypes.Secondary}
              className={classes.footerBtn}
              onClick={() => {
                resetFields()
                setIsEditing(false)
              }}
            >
              {t('calendar.cancel_changes')}
            </Button>
          ) : (
            <Button
              appearance={AppearanceTypes.Secondary}
              className={classes.footerBtn}
              onClick={() => navigate('/calendar')}
            >
              {t('calendar.cancel')}
            </Button>
          )}

          {isLastStep ? (
            isEditing ? (
              <Button
                appearance={AppearanceTypes.Primary}
                className={classes.footerBtn}
                onClick={() => handleSave()}
                disabled={isUpdating || !canSaveEdits}
              >
                {isUpdating
                  ? t('calendar.saving')
                  : t('calendar.save_changes_btn')}
              </Button>
            ) : (
              <Button
                appearance={AppearanceTypes.Primary}
                className={classes.footerBtn}
                onClick={() => handleCreate(commentText)}
                disabled={!canCreateOrder || isCreating}
              >
                {isCreating ? t('calendar.saving') : t('calendar.create_order')}
              </Button>
            )
          ) : (
            <Button
              appearance={AppearanceTypes.Primary}
              className={classes.footerBtn}
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !step1Valid}
            >
              {t('calendar.next')}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // ─── View / Edit wizard (existing order) ────────────────────────────────

  const canEdit = canModify && (isTPM || isClient)
  const step1Valid = !!selectedDate && !!startTimeInput
  const isLastStep = step === TOTAL_STEPS

  const STEP_TITLES = [
    t('calendar.step_basic_info'),
    t('calendar.order_details_title'),
    t('calendar.comments'),
    t('calendar.files_and_links'),
  ]

  const renderProgress = () => (
    <div className={classes.progress}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`${classes.progressSegment} ${i < step ? classes.progressSegmentFilled : ''}`}
        />
      ))}
    </div>
  )

  const renderStepHeader = () => (
    <div className={classes.stepHeader}>
      <div className={classes.stepCircle}>{step}</div>
      <h2 className={classes.stepTitle}>{STEP_TITLES[step - 1]}</h2>
      {canEdit && (
        <button
          className={classes.stepEditBtn}
          onClick={() => {
            if (isEditing) {
              resetFields()
              setIsEditing(false)
            } else {
              setIsEditing(true)
            }
          }}
        >
          {isEditing ? t('calendar.cancel_changes') : t('calendar.edit')}
        </button>
      )}
    </div>
  )

  // Step 1: basic info
  const renderStep1 = () => (
    <div className={classes.stepContent}>
      {isTPM && (
        <div className={classes.viewField}>
          <span className={classes.viewLabel}>{t('calendar.client')}</span>
          {isEditing ? (
            <CalendarSelect
              value={clientInstitutionId}
              onChange={setClientInstitutionId}
              options={clients.map((c) => ({
                value: c.id,
                label: [c.user.forename, c.user.surname]
                  .filter(Boolean)
                  .join(' '),
              }))}
              placeholder={t('calendar.select_client')}
            />
          ) : (
            <span className={classes.viewValue}>
              {order?.client?.name || '–'}
            </span>
          )}
        </div>
      )}

      <div className={classes.viewField}>
        <span className={classes.viewLabel}>
          {t('calendar.reference_number')}
        </span>
        {isEditing ? (
          <input
            className={classes.fieldInput}
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder={t('calendar.enter_number')}
          />
        ) : (
          <span className={classes.viewValue}>
            {order?.reference_number || '–'}
          </span>
        )}
      </div>

      {(order?.source_language || isEditing) && (
        <div className={classes.viewField}>
          <span className={classes.viewLabel}>
            {t('calendar.source_language')}
          </span>
          {isEditing ? (
            <CalendarSelect
              value={sourceLanguageId}
              onChange={setSourceLanguageId}
              options={sourceLanguageOptions}
              placeholder={t('calendar.select_source_language')}
            />
          ) : (
            <span className={classes.viewValue}>
              {order?.source_language?.name || '–'}
            </span>
          )}
        </div>
      )}

      <div className={classes.viewField}>
        <span className={classes.viewLabel}>{t('calendar.language')}</span>
        <span className={classes.viewValue}>{order?.language?.name}</span>
      </div>

      <div className={classes.viewField}>
        <span className={classes.viewLabel}>
          {t('calendar.date_and_start_time')}
        </span>
        {isEditing ? (
          <div className={classes.timeRow}>
            <input
              type="date"
              className={classes.fieldInput}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onClick={openNativeDateTimePicker}
            />
            <CalendarTimeSelect
              className={classes.fieldSelect}
              value={startTimeInput}
              onChange={setStartTimeInput}
            />
          </div>
        ) : (
          <span className={classes.viewValue}>{fmt(order?.start_at)}</span>
        )}
      </div>

      <div className={classes.viewField}>
        <span className={classes.viewLabel}>{t('calendar.duration')}</span>
        {isEditing ? (
          <CalendarSelect
            value={String(durationMinutes)}
            onChange={(v) => setDurationMinutes(Number(v))}
            options={DURATION_OPTIONS.map(({ value, label }) => ({
              value: String(value),
              label: t(label as never) as string,
            }))}
          />
        ) : (
          <span className={classes.viewValue}>{durationLabel}</span>
        )}
      </div>

      {isTPM && (
        <div className={classes.viewField}>
          <span className={classes.viewLabel}>{t('calendar.translator')}</span>
          {isEditing ? (
            <CalendarSelect
              value={vendorId}
              onChange={setVendorId}
              options={vendors.map((v) => ({
                value: v.id,
                label: v.name ?? '',
              }))}
              placeholder={t('calendar.select_translator')}
              disabled={!languageId || !startIso || !endIso}
            />
          ) : (
            <span className={classes.viewValue}>
              {order?.coordinator?.name || '–'}
            </span>
          )}
        </div>
      )}
    </div>
  )

  // Step 2: order details
  const renderStep2 = () => (
    <div className={classes.stepContent}>
      {isEditing ? (
        <div className={classes.serviceToggle}>
          <button
            type="button"
            className={`${classes.serviceOption} ${serviceType === 'ON_SITE' ? classes.serviceOptionActive : ''}`}
            onClick={() => {
              setServiceType('ON_SITE')
              setAddress('')
            }}
          >
            {t('calendar.service_type_contact')}
          </button>
          <button
            type="button"
            className={`${classes.serviceOption} ${serviceType === 'REMOTE' ? classes.serviceOptionActive : ''}`}
            onClick={() => {
              setServiceType('REMOTE')
              setAddress('')
            }}
          >
            {t('calendar.service_type_remote')}
          </button>
        </div>
      ) : (
        <div className={classes.serviceToggle}>
          <span
            className={`${classes.serviceOption} ${order?.service_type === 'ON_SITE' ? classes.serviceOptionActive : ''}`}
          >
            {t('calendar.service_type_contact')}
          </span>
          <span
            className={`${classes.serviceOption} ${order?.service_type === 'REMOTE' ? classes.serviceOptionActive : ''}`}
          >
            {t('calendar.service_type_remote')}
          </span>
        </div>
      )}

      <div className={classes.viewField}>
        <span className={classes.viewLabel}>
          {(
            isEditing
              ? serviceType === 'ON_SITE'
              : order?.service_type === 'ON_SITE'
          )
            ? t('calendar.location')
            : t('calendar.meeting_link')}
        </span>
        {isEditing ? (
          <input
            className={classes.fieldInput}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={
              serviceType === 'ON_SITE'
                ? t('calendar.enter_address')
                : t('calendar.enter_link')
            }
          />
        ) : (
          <span className={classes.viewValue}>
            {order?.service_type === 'ON_SITE'
              ? order?.location || '–'
              : order?.meeting_link || '–'}
          </span>
        )}
      </div>

      <div className={classes.viewField}>
        <span className={classes.viewLabel}>{t('calendar.domain')}</span>
        {isEditing ? (
          <MultiSelect
            options={domains ?? []}
            value={domainIds}
            onChange={setDomainIds}
            placeholder={t('calendar.select_domain')}
          />
        ) : order?.tags?.length ? (
          <div className={classes.tagList}>
            {order.tags.map((tag) => (
              <span key={tag.id} className={classes.domainChip}>
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          <span className={classes.viewValue}>–</span>
        )}
      </div>
    </div>
  )

  // Step 3: comments
  const renderStep3 = () => (
    <div className={classes.stepContent}>
      {order?.project_comments?.length ? (
        <>
          {order.project_comments.map((c) => (
            <div key={c.id} className={classes.comment}>
              {editingCommentId === c.id ? (
                <>
                  <textarea
                    className={classes.commentTextarea}
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      appearance={AppearanceTypes.Primary}
                      disabled={!editingCommentText.trim() || isUpdatingComment}
                      onClick={() => {
                        updateComment(
                          {
                            commentId: c.id,
                            comment: editingCommentText.trim(),
                          },
                          {
                            onSuccess: () => {
                              setEditingCommentId(null)
                              setEditingCommentText('')
                            },
                          }
                        )
                      }}
                    >
                      {t('calendar.save')}
                    </Button>
                    <Button
                      appearance={AppearanceTypes.Secondary}
                      onClick={() => {
                        setEditingCommentId(null)
                        setEditingCommentText('')
                      }}
                    >
                      {t('calendar.cancel')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span className={classes.commentText}>{c.comment}</span>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    {c.institution_user && (
                      <span className={classes.commentAuthor}>
                        {[
                          c.institution_user.user?.forename,
                          c.institution_user.user?.surname,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      </span>
                    )}
                    <span className={classes.commentDate}>
                      {dayjs(c.created_at).format('DD.MM.YYYY HH:mm')}
                    </span>
                    {isEditing &&
                      !isPast &&
                      c.institution_user_id === institutionUserId && (
                        <button
                          className={classes.commentEditLink}
                          onClick={() => {
                            setEditingCommentId(c.id)
                            setEditingCommentText(c.comment)
                          }}
                        >
                          {t('calendar.edit')}
                          <EditIcon className={classes.commentEditIcon} />
                        </button>
                      )}
                  </div>
                </>
              )}
            </div>
          ))}
        </>
      ) : (
        <p className={classes.emptyFiles}>{t('calendar.no_files_msg')}</p>
      )}

      {(isTPM || isClient) && !isEditing && !isPast && (
        <>
          {addingComment ? (
            <>
              <textarea
                className={classes.commentTextarea}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t('calendar.write_text')}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  appearance={AppearanceTypes.Primary}
                  disabled={!commentText.trim()}
                  onClick={() => setAddingComment(false)}
                >
                  {t('calendar.save')}
                </Button>
                <Button
                  appearance={AppearanceTypes.Secondary}
                  onClick={() => {
                    setAddingComment(false)
                    setCommentText('')
                  }}
                >
                  {t('calendar.cancel')}
                </Button>
              </div>
            </>
          ) : (
            <>
              {commentText && (
                <div className={classes.comment}>
                  <span className={classes.commentText}>{commentText}</span>
                </div>
              )}
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => setAddingComment(true)}
              >
                {t('calendar.add_comment_btn')}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  )

  // Step 4: files
  const renderStep4 = () => (
    <div className={classes.stepContent}>
      {(order?.source_files?.length ?? 0) === 0 && localFiles.length === 0 && (
        <p className={classes.emptyFiles}>{t('calendar.no_files_msg')}</p>
      )}
      {(order?.source_files?.length ?? 0) > 0 && (
        <div className={classes.fileTable}>
          {order!.source_files!.map((file) => (
            <div key={file.id} className={classes.fileRow}>
              <span className={classes.fileRowName}>
                {file.name || file.file_name}
              </span>
              <div className={classes.fileRowMeta}>
                <div className={classes.fileActions}>
                  <button
                    className={classes.fileIconBtn}
                    onClick={() =>
                      downloadFile({
                        id: file.id,
                        file_name: file.file_name,
                        collection: file.collection_name ?? 'help',
                      })
                    }
                  >
                    ↓
                  </button>
                  {isEditing && (
                    <button
                      className={classes.fileIconBtn}
                      onClick={() =>
                        deleteFile({
                          id: file.id,
                          collection: file.collection_name ?? 'help',
                        })
                      }
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isEditing && (
        <>
          <input
            ref={fileInputRef as React.RefObject<HTMLInputElement>}
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setLocalFiles((prev) => [...prev, file])
              e.target.value = ''
            }}
          />
          {localFiles.map((f, i) => (
            <div key={i} className={classes.fileRow}>
              <span className={classes.fileRowName}>{f.name}</span>
              <div className={classes.fileRowMeta}>
                <button
                  className={classes.fileIconBtn}
                  onClick={() =>
                    setLocalFiles((prev) => prev.filter((_, j) => j !== i))
                  }
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('calendar.add_file')}
          </Button>
        </>
      )}
    </div>
  )

  const renderStepContent = () => {
    if (step === 1) return renderStep1()
    if (step === 2) return renderStep2()
    if (step === 3) return renderStep3()
    return renderStep4()
  }

  return (
    <div className={classes.wizard}>
      {showScheduledCancelBanner && !isCancelPending && (
        <div
          className={classes.pendingCancelBanner}
          role="status"
          aria-live="polite"
        >
          <strong>{t('calendar.cancel_pending_title')}</strong>
          <p>
            {order?.cancel_at
              ? t('calendar.cancel_pending_body', {
                  date: dayjs(order.cancel_at).format(
                    'DD.MM.YYYY [kell] HH:mm'
                  ),
                })
              : t('calendar.cancel_confirmed_body')}
          </p>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={handleUndoCancel}
            disabled={isRefetchingOrder}
          >
            {t('calendar.decline_cancel')}
          </Button>
        </div>
      )}

      <div className={classes.orderHeader}>
        <span className={classes.orderHeaderTitle}>
          {t('calendar.order')} {order?.ext_id ?? ''}
        </span>
        <span className={classes.statusBadge}>{statusLabel}</span>
        {isRefetchingOrder && (
          <span className={classes.refetchingHint} aria-live="polite">
            {t('calendar.refetching_order')}
          </span>
        )}
      </div>

      {renderProgress()}
      {renderStepHeader()}
      {renderStepContent()}

      <div className={classes.footer}>
        {/* Left button */}
        {step > 1 ? (
          <Button
            appearance={AppearanceTypes.Secondary}
            className={classes.footerBtn}
            onClick={() => setStep((s) => s - 1)}
          >
            {t('calendar.back')}
          </Button>
        ) : isEditing ? (
          <Button
            appearance={AppearanceTypes.Secondary}
            className={classes.footerBtn}
            onClick={() => {
              resetFields()
              setIsEditing(false)
            }}
          >
            {t('calendar.cancel_changes')}
          </Button>
        ) : canEdit ? (
          <Button
            appearance={AppearanceTypes.Secondary}
            className={classes.footerBtn}
            onClick={() => setIsConfirmingCancel(true)}
          >
            {t('calendar.cancel_order')}
          </Button>
        ) : (
          <Button
            appearance={AppearanceTypes.Secondary}
            className={classes.footerBtn}
            onClick={() => navigate('/calendar')}
          >
            {t('calendar.back_to_calendar')}
          </Button>
        )}

        {/* Right button */}
        {isLastStep ? (
          isEditing ? (
            <Button
              appearance={AppearanceTypes.Primary}
              className={classes.footerBtn}
              onClick={() => handleSave()}
              disabled={isUpdating || !canSaveEdits}
            >
              {isUpdating
                ? t('calendar.saving')
                : t('calendar.save_changes_btn')}
            </Button>
          ) : (
            <Button
              appearance={AppearanceTypes.Secondary}
              className={classes.footerBtn}
              onClick={() => navigate('/calendar')}
            >
              {t('calendar.back_to_calendar')}
            </Button>
          )
        ) : (
          <Button
            appearance={AppearanceTypes.Primary}
            className={classes.footerBtn}
            onClick={() => setStep((s) => s + 1)}
            disabled={isEditing && step === 1 && !step1Valid}
          >
            {t('calendar.next')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default CalendarMobileWizard
