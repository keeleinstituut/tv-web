import { FC, useState } from 'react'
import Tag from 'components/atoms/Tag/Tag'
import classes from './classes.module.scss'

const MAX_VISIBLE = 3

interface LanguageDirectionTagsProps {
  values: string[]
}

const LanguageDirectionTags: FC<LanguageDirectionTagsProps> = ({ values }) => {
  const [expanded, setExpanded] = useState(false)

  const hasOverflow = values.length > MAX_VISIBLE
  const visible = expanded ? values : values.slice(0, MAX_VISIBLE)

  return (
    <div className={classes.wrapper}>
      <div className={classes.tagsRow}>
        {visible.map((value) => (
          <Tag label={value} value key={value} />
        ))}
        {hasOverflow && !expanded && (
          <button
            className={classes.overflowBadge}
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(true)
            }}
          >
            +{values.length - MAX_VISIBLE}
          </button>
        )}
      </div>
    </div>
  )
}

export default LanguageDirectionTags
