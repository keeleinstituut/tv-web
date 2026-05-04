import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { compact } from 'lodash'
import { ProjectComment } from 'types/projects'
import classes from './classes.module.scss'

interface ProjectCommentsSectionProps {
  comments?: ProjectComment[]
}

const ProjectCommentsSection: FC<ProjectCommentsSectionProps> = ({
  comments,
}) => {
  const { t } = useTranslation()

  if (!comments?.length) return null

  return (
    <div className={classes.section}>
      <h2 className={classes.title}>{t('calendar.comments')}</h2>
      <div className={classes.list}>
        {comments.map((c) => {
          const author = compact([
            c.institution_user?.user?.forename,
            c.institution_user?.user?.surname,
          ]).join(' ')
          return (
            <div key={c.id} className={classes.item}>
              <span className={classes.text}>{c.comment}</span>
              <div className={classes.meta}>
                {author && <span className={classes.author}>{author}</span>}
                <span className={classes.date}>
                  {t('calendar.added_at_label', {
                    date: dayjs(c.created_at).format('DD.MM.YYYY [kell] HH:mm'),
                  })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProjectCommentsSection
