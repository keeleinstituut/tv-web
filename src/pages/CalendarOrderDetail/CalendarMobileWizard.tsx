import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import dayjs from 'dayjs'
import MultiSelect from 'components/molecules/MultiSelect/MultiSelect'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import {
  useCalendarDownloadFile,
  useCalendarDeleteFile,
} from 'hooks/requests/useCalendar'
import { useOrderDetail } from './OrderDetailContext'
import classes from './mobile.module.scss'

const TOTAL_STEPS = 4

const DURATION_OPTIONS = [
  { value: 30, label: 'calendar.up_to_30min' },
  { value: 60, label: 'calendar.up_to_1h' },
  { value: 90, label: 'calendar.up_to_1h30min' },
  { value: 120, label: 'calendar.up_to_2h' },
  { value: 150, label: 'calendar.up_to_2h30min' },
  { value: 180, label: 'calendar.up_to_3h' },
  { value: 240, label: 'calendar.up_to_4h' },
  { value: 300, label: 'calendar.up_to_5h' },
]

const CalendarMobileWizard: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    order,
    isCreateMode,
    isTPM,
    isClient,
    canModify,
    statusLabel,
    durationLabel,
    fmt,
    languages,
    vendors,
    domains,
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
    isDirty,
    setPendingComment,
    handleCreate,
    handleSave,
    handleCancelOrder,
    handleUndoCancel,
    resetFields,
    isCreating,
    isUpdating,
    isCancelling,
  } = useOrderDetail()

  const [step, setStep] = useState(1)
  const [commentText, setCommentText] = useState('')
  const [addingComment, setAddingComment] = useState(false)

  const { mutate: downloadFile } = useCalendarDownloadFile({
    projectId: order?.id,
  })
  const { mutate: deleteFile } = useCalendarDeleteFile(order?.id)

  // Reset step to 1 when entering edit mode
  useEffect(() => {
    if (isEditing) setStep(1)
  }, [isEditing])

  // ─── Cancel pending screen ────────────────────────────────────────────────

  if (isCancelPending) {
    return (
      <div className={classes.wizard}>
        <div className={classes.cancelScreen}>
          <h2 className={classes.cancelScreenTitle}>
            {t('calendar.cancel_pending_title')}
          </h2>
          <p className={classes.cancelScreenBody}>
            {t('calendar.cancel_confirmed_body').replace(
              '30 s',
              `${cancelCountdown}s`
            )}
          </p>
        </div>
        <div className={classes.footer}>
          <Button
            appearance={AppearanceTypes.Primary}
            className={classes.footerBtn}
            onClick={handleUndoCancel}
          >
            {t('calendar.undo_cancel')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            className={classes.footerBtn}
            onClick={() => navigate('/calendar')}
          >
            {t('calendar.back_to_calendar')}
          </Button>
        </div>
      </div>
    )
  }

  // ─── Cancel confirmation screen ───────────────────────────────────────────

  if (isConfirmingCancel) {
    return (
      <div className={classes.wizard}>
        <div className={classes.cancelScreen}>
          <p className={classes.cancelScreenPrompt}>
            {t('calendar.cancel_order_confirm')}
          </p>
          <input
            type="text"
            className={classes.cancelReasonInput}
            placeholder={t('calendar.cancel_reason_placeholder')}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            autoFocus
          />
        </div>
        <div className={classes.footer}>
          <Button
            appearance={AppearanceTypes.Primary}
            className={classes.footerBtn}
            onClick={handleCancelOrder}
            disabled={isCancelling || !cancelReason.trim()}
          >
            {isCancelling
              ? t('calendar.voiding')
              : t('calendar.void_confirm_yes')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            className={classes.footerBtn}
            onClick={() => {
              setIsConfirmingCancel(false)
              setCancelReason('')
            }}
          >
            {t('calendar.void_confirm_no')}
          </Button>
        </div>
      </div>
    )
  }

  // ─── Create / Edit wizard ─────────────────────────────────────────────────

  if (isCreateMode || isEditing) {
    const step1Valid =
      !!selectedDate && !!startTimeInput && (isEditing || !!languageId)
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
            <input
              className={classes.fieldInput}
              value={clientInstitutionId}
              onChange={(e) => setClientInstitutionId(e.target.value)}
              placeholder={t('calendar.enter_name')}
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
            {t('calendar.language')} {isCreateMode ? '*' : ''}
          </label>
          {isCreateMode ? (
            <select
              className={classes.fieldSelect}
              value={languageId}
              onChange={(e) => {
                setLanguageId(e.target.value)
                setVendorId('')
              }}
            >
              <option value="" disabled>
                {t('calendar.select_language')}
              </option>
              {languages.map((lang) => (
                <option key={lang.language.id} value={lang.language.id}>
                  {lang.language.name}
                </option>
              ))}
            </select>
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
            />
            <input
              type="time"
              className={classes.fieldInput}
              value={startTimeInput}
              onChange={(e) => setStartTimeInput(e.target.value)}
            />
          </div>
        </div>

        <div className={classes.field}>
          <label className={classes.fieldLabel}>
            {t('calendar.duration')} *
          </label>
          <select
            className={classes.fieldSelect}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          >
            {DURATION_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {t(label as never)}
              </option>
            ))}
          </select>
        </div>

        {isTPM && (
          <div className={classes.field}>
            <label className={classes.fieldLabel}>
              {t('calendar.translator')} *
            </label>
            <select
              className={classes.fieldSelect}
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="">{t('calendar.select_translator')}</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
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
                      onClick={() => deleteFile(file.id)}
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
                onClick={() => {
                  if (commentText.trim()) setPendingComment(commentText)
                  handleSave()
                }}
                disabled={isUpdating || !isDirty}
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
                disabled={!step1Valid || isCreating}
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

  // ─── View mode ────────────────────────────────────────────────────────────

  return (
    <div className={classes.wizard}>
      <div className={classes.viewHeader}>
        <h1 className={classes.viewTitle}>
          {t('calendar.order')} {order?.ext_id ?? ''}
        </h1>
        <span className={classes.statusBadge}>{statusLabel}</span>
      </div>

      <div className={classes.viewSection}>
        <div className={classes.viewField}>
          <span className={classes.viewLabel}>
            {t('calendar.date_and_time')}
          </span>
          <span className={classes.viewValue}>{fmt(order?.start_at)}</span>
        </div>
        <div className={classes.viewField}>
          <span className={classes.viewLabel}>{t('calendar.duration')}</span>
          <span className={classes.viewValue}>{durationLabel}</span>
        </div>
        <div className={classes.viewField}>
          <span className={classes.viewLabel}>{t('calendar.language')}</span>
          <span className={classes.viewValue}>{order?.language?.name}</span>
        </div>
        {order?.reference_number && (
          <div className={classes.viewField}>
            <span className={classes.viewLabel}>
              {t('calendar.reference_number')}
            </span>
            <span className={classes.viewValue}>{order.reference_number}</span>
          </div>
        )}
      </div>

      <div className={classes.viewSection}>
        <h3 className={classes.viewSectionTitle}>
          {t('calendar.order_details_title')}
        </h3>
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
        {(order?.location || order?.meeting_link) && (
          <div className={classes.viewField}>
            <span className={classes.viewLabel}>
              {order?.service_type === 'ON_SITE'
                ? t('calendar.location')
                : t('calendar.meeting_link')}
            </span>
            <span className={classes.viewValue}>
              {order?.service_type === 'ON_SITE'
                ? order?.location
                : order?.meeting_link}
            </span>
          </div>
        )}
        {order?.tags?.length ? (
          <div className={classes.viewField}>
            <span className={classes.viewLabel}>{t('calendar.domain')}</span>
            <div className={classes.tagList}>
              {order.tags.map((tag) => (
                <span key={tag.id} className={classes.domainChip}>
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className={classes.viewSection}>
        <h3 className={classes.viewSectionTitle}>
          {t('calendar.attachments')}
        </h3>
        {order?.source_files?.length ? (
          <div className={classes.fileTable}>
            {order.source_files.map((file) => (
              <div key={file.id} className={classes.fileRow}>
                <span className={classes.fileRowName}>
                  {file.name || file.file_name}
                </span>
                <div className={classes.fileRowMeta}>
                  <button
                    className={classes.fileIconBtn}
                    onClick={() =>
                      downloadFile({ id: file.id, file_name: file.file_name })
                    }
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={classes.emptyFiles}>{t('calendar.no_files_msg')}</p>
        )}
      </div>

      <div className={classes.viewSection}>
        <h3 className={classes.viewSectionTitle}>{t('calendar.comments')}</h3>
        {order?.project_comments?.length ? (
          <>
            {order.project_comments.map((c) => (
              <div key={c.id} className={classes.comment}>
                <span className={classes.commentText}>{c.comment}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                </div>
              </div>
            ))}
          </>
        ) : (
          <p className={classes.emptyFiles}>{t('calendar.no_files_msg')}</p>
        )}
      </div>

      <div className={classes.footer}>
        {canModify && (isTPM || isClient) ? (
          <>
            <Button
              appearance={AppearanceTypes.Primary}
              className={classes.footerBtn}
              onClick={() => setIsEditing(true)}
            >
              {t('calendar.edit')}
            </Button>
            <Button
              appearance={AppearanceTypes.Secondary}
              className={classes.footerBtn}
              onClick={() => setIsConfirmingCancel(true)}
            >
              {t('calendar.cancel_order')}
            </Button>
          </>
        ) : (
          <Button
            appearance={AppearanceTypes.Secondary}
            className={classes.footerBtn}
            onClick={() => navigate('/calendar')}
          >
            {t('calendar.back_to_calendar')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default CalendarMobileWizard
