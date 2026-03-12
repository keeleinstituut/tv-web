import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import ExpandIcon from 'assets/icons/expand.svg?react'
import ShrinkIcon from 'assets/icons/shrink.svg?react'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import classes from './classes.module.scss'

interface Props {
  languageIds: string[]
}

const CalendarCollapseExpandButton: FC<Props> = ({ languageIds }) => {
  const { t } = useTranslation()
  const { expandedLanguageIds, expandAll, collapseAll } = useCalendarContext()
  const allExpanded =
    languageIds.length > 0 &&
    languageIds.every((id) => expandedLanguageIds.includes(id))

  return (
    <button
      className={classes.btn}
      onClick={() =>
        allExpanded ? collapseAll() : expandAll(languageIds)
      }
      aria-label={
        allExpanded ? t('calendar.collapse_all') : t('calendar.expand_all')
      }
    >
      {allExpanded ? (
        <ShrinkIcon className={classes.icon} />
      ) : (
        <ExpandIcon className={classes.icon} />
      )}
    </button>
  )
}

export default CalendarCollapseExpandButton
