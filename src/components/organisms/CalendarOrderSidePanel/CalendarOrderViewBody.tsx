import { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { ServiceType } from 'types/calendar'
import { useFetchInfiniteProjectPerson } from 'hooks/requests/useUsers'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import DownloadIcon from 'assets/icons/download.svg?react'
import DeleteIcon from 'assets/icons/delete.svg?react'
import MultiSelect from 'components/molecules/MultiSelect/MultiSelect'
import { useSidePanel } from './SidePanelContext'
import DurationStepper from './DurationStepper'
import SlotMetaSection from './SlotMetaSection'
import classes from './classes.module.scss'

const CalendarOrderViewBody: FC = () => {
  const { t } = useTranslation()
  const {
    language,
    slot,
    date,
    startTime,
    duration,
    isPastSlot,
    isEditing,
    isConfirmingCancel,
    setIsConfirmingCancel: onSetIsConfirmingCancel,
    cancelReason,
    setCancelReason: onSetCancelReason,
    isCancelled,
    isMetaOpen,
    setIsMetaOpen: onSetIsMetaOpen,
    durationMinutes,
    setDurationMinutes: onSetDurationMinutes,
    referenceNumber,
    setReferenceNumber: onSetReferenceNumber,
    serviceType,
    setServiceType: onSetServiceType,
    location,
    setLocation: onSetLocation,
    selectedDate,
    setSelectedDate: onSetSelectedDate,
    startTimeInput,
    setStartTimeInput: onSetStartTimeInput,
    clientInstitutionId,
    setClientInstitutionId: onSetClientInstitutionId,
    domainIds,
    setDomainIds: onSetDomainIds,
    vendorId,
    vendorLocked,
    setVendorId: onSetVendorId,
    vendorName,
    isUpdating,
    isCancelling,
    handleStartEdit: onStartEdit,
    handleCancelEdit: onCancelEdit,
    handleSaveEdit: onSaveEdit,
    handleVoidConfirm: onVoidConfirm,
    handleUndoCancel: onUndoCancel,
    handleDeclineCancel: onDeclineCancel,
    isDecliningCancel,
    isRequiredFilled,
    domains,
    vendors,
    order,
    addFiles,
    downloadFile,
    deleteFile,
    isAddingFiles,
    isDeletingFile,
    pendingComment,
    setPendingComment,
    addComment,
    isPostingComment,
    isTPM,
  } = useSidePanel()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFilesOpen, setIsFilesOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [commentText, setCommentText] = useState('')

  const { users: clients } = useFetchInfiniteProjectPerson(
    undefined,
    'client',
    isTPM && isEditing
  )

  return (
    <>
      {/* ── Top action bar ── */}
      {isTPM && isCancelled ? (
        <div className={classes.translatorActions}>
          <Button appearance={AppearanceTypes.Secondary} onClick={onUndoCancel}>
            {t('calendar.undo_cancel')}
          </Button>
        </div>
      ) : order?.cancel_at ? null : isEditing ? (
        <div className={classes.clientEditBar}>
          <button className={classes.loobuLink} onClick={onCancelEdit}>
            <ChevronLeft style={{ width: 14, height: 14 }} />
            {t('calendar.abandon_editing')}
          </button>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={onSaveEdit}
            disabled={isUpdating || !isRequiredFilled}
          >
            {isUpdating ? t('calendar.saving') : t('calendar.save')}
          </Button>
        </div>
      ) : isTPM && isConfirmingCancel ? (
        <div className={classes.clientEditBar}>
          <button
            className={classes.loobuLink}
            onClick={() => onSetIsConfirmingCancel(false)}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} />
            {t('calendar.abandon_cancelling')}
          </button>
          <button
            className={classes.dangerBtn}
            onClick={onVoidConfirm}
            disabled={isCancelling || !cancelReason.trim()}
          >
            {isCancelling
              ? t('calendar.voiding')
              : t('calendar.void_confirm_yes_full')}
          </button>
        </div>
      ) : !isPastSlot ? (
        <div className={classes.translatorActions}>
          {!isTPM && isConfirmingCancel ? (
            <>
              <Button
                appearance={AppearanceTypes.Primary}
                onClick={onVoidConfirm}
                disabled={isCancelling || !cancelReason.trim()}
              >
                {isCancelling
                  ? t('calendar.voiding')
                  : t('calendar.void_confirm_yes')}
              </Button>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => onSetIsConfirmingCancel(false)}
                disabled={isCancelling}
              >
                {t('calendar.void_confirm_no')}
              </Button>
            </>
          ) : (
            <>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={onStartEdit}
              >
                {t('calendar.edit')}
              </Button>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => onSetIsConfirmingCancel(true)}
              >
                {t('calendar.void')}
              </Button>
            </>
          )}
        </div>
      ) : null}

      {/* Cancel warning banner */}
      {isConfirmingCancel && (
        <div className={classes.cancelWarning}>
          <strong>{t('calendar.cancel_warning_title')}</strong>
          <p>{t('calendar.cancel_warning_body')}</p>
          <textarea
            className={classes.textarea}
            placeholder={t('calendar.cancel_reason_placeholder')}
            value={cancelReason}
            onChange={(e) => onSetCancelReason(e.target.value)}
          />
        </div>
      )}

      {/* Pending cancel banner — delayed cancel scheduled */}
      {order?.cancel_at && (
        <div className={classes.pendingCancelBanner}>
          <strong>{t('calendar.cancel_pending_title')}</strong>
          <p>
            {t('calendar.cancel_pending_body', {
              date: dayjs(order.cancel_at).format('DD.MM.YYYY [kell] HH:mm'),
            })}
          </p>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={onDeclineCancel}
            disabled={isDecliningCancel}
          >
            {t('calendar.decline_cancel')}
          </Button>
        </div>
      )}

      {/* Post-cancel banner — TPM only (immediate cancel fallback) */}
      {isTPM && isCancelled && !order?.cancel_at && (
        <div className={classes.cancelledBanner}>
          <strong>{t('calendar.cancel_confirmed_title')}</strong>
          <p>{t('calendar.cancel_confirmed_body')}</p>
        </div>
      )}

      <div className={classes.form}>
        {/* Status badge */}
        <div className={classes.statusBadgeGrey}>
          {order?.cancel_at
            ? t('calendar.status_cancelling')
            : isTPM && isCancelled
              ? t('calendar.status_cancelled')
              : slot?.assignment?.status === 'DONE'
                ? t('calendar.status_completed')
                : slot?.assignment?.status === 'IN_PROGRESS'
                  ? t('calendar.status_forwarded')
                  : t('calendar.status_pending')}
        </div>

        {isEditing && (
          <p className={classes.requiredNotice}>
            {t('calendar.required_fields')}
          </p>
        )}

        {/* Tellija — TPM only */}
        {isTPM &&
          (isEditing ? (
            <div className={classes.formGroup}>
              <label className={classes.label}>
                {t('calendar.client')}
                <span className={classes.requiredMark}>*</span>
              </label>
              <select
                className={classes.select}
                value={clientInstitutionId}
                onChange={(e) => onSetClientInstitutionId(e.target.value)}
              >
                <option value="">{t('calendar.select_client')}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {[c.user.forename, c.user.surname]
                      .filter(Boolean)
                      .join(' ')}
                  </option>
                ))}
              </select>
            </div>
          ) : slot?.assignment?.client ? (
            <div className={classes.formGroup}>
              <span className={classes.label}>{t('calendar.client')}</span>
              <span className={classes.readValue}>
                {slot.assignment.client.name}
              </span>
            </div>
          ) : null)}

        {/* Viitenumber */}
        {isEditing ? (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.reference_number')}
              <span className={classes.requiredMark}>*</span>
            </label>
            <input
              className={classes.input}
              value={referenceNumber}
              onChange={(e) => onSetReferenceNumber(e.target.value)}
            />
          </div>
        ) : slot?.assignment?.reference_number ? (
          <div className={classes.formGroup}>
            <span className={classes.label}>
              {t('calendar.reference_number')}
            </span>
            <span className={classes.readValue}>
              {slot.assignment.reference_number}
            </span>
          </div>
        ) : null}

        {/* Keel */}
        <div className={classes.formGroup}>
          <span className={classes.label}>
            {t('calendar.language')}
            {isEditing && <span className={classes.requiredMark}>*</span>}
          </span>
          {isEditing ? (
            <div className={classes.inputReadonly}>
              {language?.language.name ?? ''}
            </div>
          ) : (
            <span className={classes.readValue}>
              {language?.language.name ?? ''}
            </span>
          )}
        </div>

        {/* Kuupäev ja kellaaeg */}
        <div className={classes.formGroup}>
          <label className={classes.label}>
            {isEditing
              ? t('calendar.date_and_start_time')
              : t('calendar.date_and_time')}
            {isEditing && <span className={classes.requiredMark}>*</span>}
          </label>
          {isEditing ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className={classes.input}
                value={selectedDate}
                onChange={(e) => onSetSelectedDate(e.target.value)}
                placeholder="pp.kk.aaaa"
              />
              <input
                className={classes.input}
                style={{ width: 90, flexShrink: 0 }}
                value={startTimeInput}
                onChange={(e) => onSetStartTimeInput(e.target.value)}
                placeholder="hh:mm"
              />
            </div>
          ) : (
            <span className={classes.readValue}>
              {date} / {startTime}
            </span>
          )}
        </div>

        {/* Kestus */}
        {isEditing ? (
          <div className={classes.durationGroup}>
            <label className={classes.label}>
              {t('calendar.duration')}
              <span className={classes.requiredMark}>*</span>
            </label>
            <DurationStepper
              durationMinutes={durationMinutes}
              onSetDurationMinutes={onSetDurationMinutes}
            />
            {!isTPM && (
              <span className={classes.sectionNote}>
                {t('calendar.cannot_extend_time')}
              </span>
            )}
          </div>
        ) : (
          <div className={classes.formGroup}>
            <span className={classes.label}>{t('calendar.duration')}</span>
            <span className={classes.readValue}>{duration}</span>
            {slot?.assignment?.updated_at && (
              <span className={classes.sectionNote}>
                {t('calendar.last_modified', {
                  date: dayjs(slot.assignment.updated_at).format(
                    'DD.MM.YYYY [kell] HH:mm'
                  ),
                })}
              </span>
            )}
          </div>
        )}

        {/* Teostaja — TPM only */}
        {isTPM &&
          (isEditing ? (
            <div className={classes.formGroup}>
              <label className={classes.label}>
                {t('calendar.translator')}
                <span className={classes.requiredMark}>*</span>
              </label>
              <select
                className={classes.select}
                value={vendorId}
                disabled={vendorLocked}
                onChange={(e) => onSetVendorId(e.target.value)}
              >
                <option value="">{t('calendar.select_translator')}</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          ) : vendorName || slot?.assignment ? (
            <div className={classes.formGroup}>
              <span className={classes.label}>{t('calendar.translator')}</span>
              <span className={classes.readValue}>{vendorName ?? '—'}</span>
            </div>
          ) : null)}

        {/* Tellimuse viis */}
        {isEditing ? (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.order_way')}
              <span className={classes.requiredMark}>*</span>
            </label>
            <select
              className={classes.select}
              value={serviceType}
              onChange={(e) => {
                onSetServiceType(e.target.value as ServiceType)
                onSetLocation('')
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
        ) : (slot?.assignment?.service_type ?? order?.service_type) ? (
          <div className={classes.formGroup}>
            <span className={classes.label}>{t('calendar.order_way')}</span>
            <span className={classes.readValue}>
              {(slot?.assignment?.service_type ?? order?.service_type) ===
              'REMOTE'
                ? t('calendar.service_type_remote')
                : t('calendar.service_type_contact')}
            </span>
          </div>
        ) : null}

        {!isEditing && order?.location && (
          <div className={classes.formGroup}>
            <span className={classes.label}>{t('calendar.location')}</span>
            <span className={classes.readValueBlue}>{order.location}</span>
          </div>
        )}
        {!isEditing && order?.meeting_link && (
          <div className={classes.formGroup}>
            <span className={classes.label}>{t('calendar.meeting_link')}</span>
            <a
              className={classes.meetingLink}
              href={order.meeting_link}
              target="_blank"
              rel="noreferrer"
            >
              {order.meeting_link}
            </a>
          </div>
        )}

        {/* Asukoht / Koosoleku link — edit mode only */}
        {isEditing && serviceType === 'kontakttolge' && (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.location')}
              <span className={classes.requiredMark}>*</span>
            </label>
            <input
              className={classes.input}
              value={location}
              onChange={(e) => onSetLocation(e.target.value)}
              placeholder={t('calendar.enter_address')}
            />
          </div>
        )}
        {isEditing && serviceType === 'kaugtolge' && (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.meeting_link')}
              <span className={classes.requiredMark}>*</span>
            </label>
            <input
              className={classes.input}
              value={location}
              onChange={(e) => onSetLocation(e.target.value)}
              placeholder={t('calendar.enter_link')}
            />
          </div>
        )}

        {/* Valdkond — edit only */}
        {isEditing && (
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.domain')}</label>
            <MultiSelect
              options={domains ?? []}
              value={domainIds}
              onChange={onSetDomainIds}
              placeholder={t('calendar.select_domain')}
            />
          </div>
        )}

        {/* Metaandmed — view only */}
        {!isEditing && (
          <SlotMetaSection
            source={order}
            isMetaOpen={isMetaOpen}
            onToggle={() => onSetIsMetaOpen(!isMetaOpen)}
          />
        )}
      </div>

      {/* Lisamaterjalid */}
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <span className={classes.sectionLabel}>
          {t('calendar.attachments')}
        </span>
        {!!order?.source_files?.length && (
          <button
            className={classes.sectionBtn}
            onClick={() => setIsFilesOpen(!isFilesOpen)}
          >
            <span className={classes.sectionNote}>
              {order.source_files.length}
            </span>
            <ChevronLeft
              className={classNames(classes.sectionChevron, {
                [classes.sectionChevronOpen]: isFilesOpen,
              })}
            />
          </button>
        )}
        {isEditing && !isPastSlot && !(isTPM && isCancelled) && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                if (files.length) addFiles(files)
                e.target.value = ''
              }}
            />
            <button
              className={classes.sectionBtn}
              disabled={isAddingFiles}
              onClick={() => fileInputRef.current?.click()}
            >
              {t('calendar.add_short')}
              <AddIcon style={{ width: 16, height: 16 }} />
            </button>
          </>
        )}
      </div>
      {isFilesOpen && !!order?.source_files?.length && (
        <div className={classes.fileList}>
          {order.source_files.map((f) => (
            <div key={f.id} className={classes.fileItem}>
              <button
                className={classes.fileLink}
                onClick={() =>
                  downloadFile({ id: f.id, file_name: f.file_name })
                }
              >
                {f.name}
              </button>
              <DownloadIcon
                className={classes.downloadIcon}
                onClick={() =>
                  downloadFile({ id: f.id, file_name: f.file_name })
                }
                style={{ cursor: 'pointer' }}
              />
              {isEditing && (
                <button
                  className={classes.fileIconBtn}
                  disabled={isDeletingFile}
                  onClick={() => deleteFile(f.id)}
                >
                  <DeleteIcon style={{ width: 24, height: 24 }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Kommentaarid */}
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <span className={classes.sectionLabel}>{t('calendar.comments')}</span>
        {!!order?.project_comments?.length && (
          <button
            className={classes.sectionBtn}
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          >
            <span className={classes.sectionNote}>
              {order.project_comments!.length}
            </span>
            <ChevronLeft
              className={classNames(classes.sectionChevron, {
                [classes.sectionChevronOpen]: isCommentsOpen,
              })}
            />
          </button>
        )}
        {!isAddingComment && !(isTPM && isCancelled) && !isPastSlot && (
          <button
            className={classes.sectionBtn}
            onClick={() => setIsAddingComment(true)}
          >
            {t('calendar.add_short')}
            <AddIcon style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>
      {!isAddingComment && isEditing && pendingComment && (
        <div className={classes.commentContent}>
          <span className={classes.commentText}>{pendingComment}</span>
        </div>
      )}
      {isAddingComment && (
        <div className={classes.commentForm}>
          <textarea
            className={classes.textarea}
            placeholder={t('calendar.write_text')}
            value={isEditing ? pendingComment : commentText}
            onChange={(e) =>
              isEditing
                ? setPendingComment(e.target.value)
                : setCommentText(e.target.value)
            }
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button
              appearance={AppearanceTypes.Primary}
              disabled={
                isEditing
                  ? !pendingComment.trim()
                  : !commentText.trim() || isPostingComment
              }
              onClick={() => {
                if (isEditing) {
                  setIsAddingComment(false)
                } else {
                  addComment(commentText.trim())
                  setCommentText('')
                  setIsAddingComment(false)
                }
              }}
            >
              {t('calendar.save')}
            </Button>
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={() => {
                setIsAddingComment(false)
                if (isEditing) setPendingComment('')
                else setCommentText('')
              }}
            >
              {t('calendar.cancel')}
            </Button>
          </div>
        </div>
      )}
      {isCommentsOpen && !!order?.project_comments?.length && (
        <>
          {order.project_comments.map((c) => (
            <div key={c.id} className={classes.commentContent}>
              <span className={classes.commentText}>{c.comment}</span>
              <span className={classes.commentDate}>
                {t('calendar.added_at', {
                  date: dayjs(c.created_at).format('DD.MM.YYYY [kell] HH:mm'),
                })}
              </span>
            </div>
          ))}
        </>
      )}
    </>
  )
}

export default CalendarOrderViewBody
