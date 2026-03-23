import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import CollapseExpandIcon from 'assets/icons/collapse_expand.svg?react'
import { useCalendarExpansion } from 'components/contexts/CalendarContext'
import { CalendarLanguage } from 'types/calendar'
import classes from './classes.module.scss'

interface Props {
  languages: CalendarLanguage[]
}

const CalendarCollapseExpandButton: FC<Props> = ({ languages }) => {
  const { t } = useTranslation()
  const { isLanguageExpanded, expandAll, collapseAll, allCollapsedOverride } =
    useCalendarExpansion()

  const anyExpanded =
    !allCollapsedOverride &&
    languages.some((l) => l.pinned || isLanguageExpanded(l.language.id))

  return (
    <button
      className={classes.btn}
      onClick={() =>
        anyExpanded
          ? collapseAll()
          : expandAll(languages.map((l) => l.language.id))
      }
      aria-label={
        anyExpanded ? t('calendar.collapse_all') : t('calendar.expand_all')
      }
    >
      <CollapseExpandIcon className={classes.icon} />
    </button>
  )
}

export default CalendarCollapseExpandButton
