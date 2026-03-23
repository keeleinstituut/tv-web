import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useOrderDetail } from './OrderDetailContext'
import classes from './classes.module.scss'

const OrderCommentsCard: FC = () => {
  const { t } = useTranslation()
  const {
    order,
    isCreateMode,
    isTPM,
    isClient,
    isAddingComment,
    setIsAddingComment,
    commentText,
    setCommentText,
    editingCommentIdx,
    setEditingCommentIdx,
    editingCommentText,
    setEditingCommentText,
  } = useOrderDetail()

  return (
    <div className={classes.card}>
      <h2 className={classes.sectionTitle}>{t('calendar.comments')}</h2>
      <div className={classes.comments}>
        {!isCreateMode &&
          order!.comments.map((c, i) => (
            <div key={i} className={classes.comment}>
              <span className={classes.commentAuthor}>{c.role}</span>
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
                      disabled={!editingCommentText.trim()}
                      onClick={() => {
                        setEditingCommentIdx(null)
                        setEditingCommentText('')
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
                <span className={classes.commentText}>{c.text}</span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={classes.commentDate}>
                  {t('calendar.added_at_label', {
                    date: dayjs(c.created_at).format('DD.MM.YYYY [kell] HH:mm'),
                  })}
                </span>
                {(isTPM || isClient) && editingCommentIdx !== i && (
                  <button
                    className={classes.commentEditLink}
                    onClick={() => {
                      setEditingCommentIdx(i)
                      setEditingCommentText(c.text)
                    }}
                  >
                    {t('calendar.edit')}
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
              disabled={!commentText.trim()}
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
        <Button
          appearance={AppearanceTypes.Secondary}
          onClick={() => setIsAddingComment(true)}
        >
          {t('calendar.add_comment_btn')}
        </Button>
      )}
    </div>
  )
}

export default OrderCommentsCard
