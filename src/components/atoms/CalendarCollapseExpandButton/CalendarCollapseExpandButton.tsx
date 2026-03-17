import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { CalendarLanguage } from 'types/calendar'
import classes from './classes.module.scss'

interface Props {
  languages: CalendarLanguage[]
}

const CalendarCollapseExpandButton: FC<Props> = ({ languages }) => {
  const { t } = useTranslation()
  const { isLanguageExpanded, expandAll, collapseAll, allCollapsedOverride } =
    useCalendarContext()

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
      <svg
        viewBox="0 0 16 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={classes.icon}
      >
        <path
          d="M3 7L8 2L13 7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 13L8 18L13 13"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default CalendarCollapseExpandButton
