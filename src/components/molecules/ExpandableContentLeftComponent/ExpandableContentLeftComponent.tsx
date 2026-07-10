import { FC, PropsWithChildren } from 'react'
import Tag from 'components/atoms/Tag/Tag'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { ProjectDetailModes } from 'components/organisms/ProjectDetails/ProjectDetails'

import classes from './classes.module.scss'

interface ColumnProps {
  label?: string
  compact?: boolean
}

const Column: FC<PropsWithChildren<ColumnProps>> = ({
  label,
  children,
  compact,
}) => (
  <div
    className={`${classes.column}${compact ? ` ${classes.columnCompact}` : ''}`}
  >
    <span className={classes.label}>{label}</span>
    {children}
  </div>
)

interface ExpandableContentLeftComponentProps {
  languageDirection?: string
  ext_id: string
  price?: string
  deadline_at?: string
  mode?: ProjectDetailModes
  isVerbal?: boolean
  hideCost?: boolean
}

const ExpandableContentLeftComponent: FC<
  ExpandableContentLeftComponentProps
> = ({ languageDirection, ext_id, price, deadline_at, mode, isVerbal, hideCost }) => {
  const { t } = useTranslation()

  return (
    <>
      <Column label={t('label.language_direction')}>
        <Tag label={languageDirection || '-'} value />
      </Column>
      <Column
        label={
          mode === ProjectDetailModes.View
            ? t('my_tasks.assignment_id')
            : t('label.sub_project_id')
        }
      >
        <span className={classes.valueText}>{ext_id}</span>
      </Column>
      {!hideCost && (
        <Column label={t('label.cost')}>
          <span className={classes.boldValueText}>
            {price ? `${price}€` : '-'}
          </span>
        </Column>
      )}
      <Column
        label={t(isVerbal ? 'label.event_start_at' : 'label.deadline_at')}
        compact={isVerbal}
      >
        <span className={classes.valueText}>
          {deadline_at ? dayjs(deadline_at).format('DD.MM.YYYY HH:mm') : '-'}
        </span>
      </Column>
    </>
  )
}

export default ExpandableContentLeftComponent
