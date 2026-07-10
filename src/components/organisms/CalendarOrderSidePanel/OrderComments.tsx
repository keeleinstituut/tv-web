import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import AddIcon from 'assets/icons/add.svg?react'
import EditIcon from 'assets/icons/edit.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useUpdateCalendarOrderComment } from 'hooks/requests/useCalendar'
import { useAuth } from 'components/contexts/AuthContext'
import { useSidePanel } from './SidePanelContext'
import classes from './classes.module.scss'

const OrderComments: FC = () => {
  const { t } = useTranslation()
  const {
    isEditing,
    isPastSlot,
    isTPM,
    isCancelled,
    order,
    addComment,
    isPostingComment,
  } = useSidePanel()
  const { institutionUserId } = useAuth()
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

  return (
    <>
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <span className={classes.sectionLabel}>{t('calendar.comments')}</span>
        {!!order?.project_comments?.length && (
          <button
            className={classes.sectionBtn}
            onClick={() => setIsCommentsOpen((v) => !v)}
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
                      disabled={
                        !editingCommentText.trim() || isUpdatingComment
                      }
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

export default OrderComments
