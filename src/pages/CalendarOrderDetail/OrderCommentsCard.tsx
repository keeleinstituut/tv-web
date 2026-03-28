import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import EditIcon from 'assets/icons/edit.svg?react'
import { useUpdateCalendarOrderComment } from 'hooks/requests/useCalendar'
import { useOrderDetail } from './OrderDetailContext'
import classes from './classes.module.scss'

const OrderCommentsCard: FC = () => {
  const { t } = useTranslation()
  const {
    order,
    isCreateMode,
    isTPM,
    isClient,
    isTranslator,
    isPast,
    isEditing,
    isAddingComment,
    setIsAddingComment,
    commentText,
    setCommentText,
    editingCommentIdx,
    setEditingCommentIdx,
    editingCommentText,
    setEditingCommentText,
    pendingComment,
    setPendingComment,
    addComment,
    isPostingComment,
  } = useOrderDetail()

  const { mutate: updateComment, isPending: isUpdatingComment } =
    useUpdateCalendarOrderComment(order?.id)

  const handleSaveComment = () => {
    const text = commentText.trim()
    if (!text) return
    if (isCreateMode || isEditing) {
      setPendingComment(text)
    } else {
      addComment(text)
    }
    setCommentText('')
    setIsAddingComment(false)
  }

  return (
    <div className={classes.card}>
      <h2 className={classes.sectionTitle}>{t('calendar.comments')}</h2>
      <div className={classes.comments}>
        {!isCreateMode &&
          order!.project_comments?.map((c, i) => (
            <div key={c.id} className={classes.comment}>
              {editingCommentIdx === i ? (
                <div className={classes.commentForm}>
                  <textarea
                    className={classes.commentTextarea}
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    autoFocus
                  />
                  <div className={classes.commentFormActions}>
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
                              setEditingCommentIdx(null)
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
                        setEditingCommentIdx(null)
                        setEditingCommentText('')
                      }}
                    >
                      {t('calendar.cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <span className={classes.commentText}>{c.comment}</span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                  {t('calendar.added_at_label', {
                    date: dayjs(c.created_at).format('DD.MM.YYYY [kell] HH:mm'),
                  })}
                </span>
                {(isTPM || isClient) && !isPast && editingCommentIdx !== i && (
                  <button
                    className={classes.commentEditLink}
                    onClick={() => {
                      setEditingCommentIdx(i)
                      setEditingCommentText(c.comment)
                    }}
                  >
                    {t('calendar.edit')}
                    <EditIcon className={classes.commentEditIcon} />
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      {isAddingComment ? (
        <div className={classes.commentForm}>
          <textarea
            className={classes.commentTextarea}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('calendar.write_text')}
            autoFocus
          />
          <div className={classes.commentFormActions}>
            <Button
              appearance={AppearanceTypes.Primary}
              disabled={!commentText.trim() || isPostingComment}
              onClick={handleSaveComment}
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
      ) : (
        <>
          {pendingComment && (
            <div className={classes.comment}>
              <span className={classes.commentText}>{pendingComment}</span>
              <span className={classes.commentDate}>
                {t('calendar.pending_save_notice')}
              </span>
            </div>
          )}
          {(isCreateMode || isEditing) &&
            (isTPM || isClient || isTranslator) && (
              <Button
                style={{ width: '209px' }}
                appearance={AppearanceTypes.Secondary}
                onClick={() => setIsAddingComment(true)}
              >
                {t('calendar.add_comment_btn')}
              </Button>
            )}
        </>
      )}
    </div>
  )
}

export default OrderCommentsCard
