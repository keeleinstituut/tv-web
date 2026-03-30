import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { ServiceType } from 'types/calendar'
import { useFetchInfiniteProjectPerson } from 'hooks/requests/useUsers'
import { useUpdateCalendarOrderComment } from 'hooks/requests/useCalendar'
import { useAuth } from 'components/contexts/AuthContext'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import DownloadIcon from 'assets/icons/download.svg?react'
import DeleteIcon from 'assets/icons/delete.svg?react'
import EditIcon from 'assets/icons/edit.svg?react'
import MultiSelect from 'components/molecules/MultiSelect/MultiSelect'
import { useSidePanel } from './SidePanelContext'
import OrderServiceLocationReadonly from './OrderServiceLocationReadonly'
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
    addComment,
    isPostingComment,
    isTPM,
  } = useSidePanel()
  const { institutionUserId } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFilesOpen, setIsFilesOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const { mutate: updateComment, isPending: isUpdatingComment } =
    useUpdateCalendarOrderComment(order?.id)

  useEffect(() => {
    if (isEditing) setIsAddingComment(false)
  }, [isEditing])

  const { users: clients } = useFetchInfiniteProjectPerson(
    undefined,
    'client',
    isTPM && isEditing
  )

  const assignment = slot?.assignment

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
                {isTPM ? t('calendar.void') : t('calendar.cancel_order')}
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
              : assignment?.status === 'DONE'
                ? t('calendar.status_completed')
                : assignment?.status === 'IN_PROGRESS'
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
          ) : assignment?.client ? (
            <div className={classes.formGroup}>
              <span className={classes.label}>{t('calendar.client')}</span>
              <span className={classes.readValue}>
                {assignment.client.name}
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
        ) : assignment?.reference_number ? (
          <div className={classes.formGroup}>
            <span className={classes.label}>
              {t('calendar.reference_number')}
            </span>
            <span className={classes.readValue}>
              {assignment.reference_number}
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
            {assignment?.updated_at && (
              <span className={classes.sectionNote}>
                {t('calendar.last_modified', {
                  date: dayjs(assignment.updated_at).format(
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
          ) : vendorName || assignment ? (
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
        ) : (assignment?.service_type ?? order?.service_type) ? (
          <OrderServiceLocationReadonly
            variant="view"
            serviceType={
              assignment?.service_type ?? order?.service_type ?? null
            }
            location={order?.location}
            meetingLink={order?.meeting_link}
          />
        ) : null}

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

        {/* Valdkond */}
        {isEditing ? (
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.domain')}</label>
            <MultiSelect
              options={domains ?? []}
              value={domainIds}
              onChange={onSetDomainIds}
              placeholder={t('calendar.select_domain')}
            />
          </div>
        ) : order?.tags?.length ? (
          <div className={classes.formGroup}>
            <span className={classes.label}>{t('calendar.domain')}</span>
            <div className={classes.tagList}>
              {order.tags.map((tag) => (
                <span key={tag.id} className={classes.domainChip}>
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

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
                  downloadFile({
                    id: f.id,
                    file_name: f.file_name,
                    collection: f.collection_name ?? 'help',
                  })
                }
              >
                {f.name}
              </button>
              <DownloadIcon
                className={classes.downloadIcon}
                onClick={() =>
                  downloadFile({
                    id: f.id,
                    file_name: f.file_name,
                    collection: f.collection_name ?? 'help',
                  })
                }
                style={{ cursor: 'pointer' }}
              />
              {isEditing && (
                <button
                  className={classes.fileIconBtn}
                  disabled={isDeletingFile}
                  onClick={() =>
                    deleteFile({
                      id: f.id,
                      collection: f.collection_name ?? 'help',
                    })
                  }
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
        {!isAddingComment &&
          !(isTPM && isCancelled) &&
          !isPastSlot &&
          !isEditing && (
            <button
              className={classes.sectionBtn}
              onClick={() => setIsAddingComment(true)}
            >
              {t('calendar.add_short')}
              <AddIcon style={{ width: 16, height: 16 }} />
            </button>
          )}
      </div>
      {isAddingComment && !isEditing && (
        <div className={classes.commentForm}>
          <textarea
            className={classes.textarea}
            placeholder={t('calendar.write_text')}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button
              appearance={AppearanceTypes.Primary}
              disabled={!commentText.trim() || isPostingComment}
              onClick={() => {
                addComment(commentText.trim())
                setCommentText('')
                setIsAddingComment(false)
              }}
            >
              {t('calendar.save')}
            </Button>
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={() => {
                setIsAddingComment(false)
                setCommentText('')
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
              {editingCommentId === c.id ? (
                <>
                  <textarea
                    className={classes.textarea}
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
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
                    <span className={classes.commentDate}>
                      {t('calendar.added_at', {
                        date: dayjs(c.created_at).format(
                          'DD.MM.YYYY [kell] HH:mm'
                        ),
                      })}
                    </span>
                    {isEditing &&
                      c.institution_user_id === institutionUserId &&
                      !isPastSlot && (
                        <button
                          className={classes.commentEditLink}
                          onClick={() => {
                            setEditingCommentId(c.id)
                            setEditingCommentText(c.comment)
                          }}
                        >
                          <EditIcon style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                  </div>
                </>
              )}
            </div>
          ))}
        </>
      )}
    </>
  )
}

export default CalendarOrderViewBody
