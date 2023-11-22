import { FC } from 'react'
import classNames from 'classnames'
import { isEmpty, map } from 'lodash'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import classes from './classes.module.scss'

interface ToggleTab {
  label?: string
  id?: string
}
export interface ToggleTabsProps {
  className?: string
  tabs?: ToggleTab[]
  hidden?: boolean
  dateTabsClassName?: string
  value?: string
  onChange?: (id: string) => void
}

const ToggleTabs: FC<ToggleTabsProps> = ({
  className,
  tabs = [],
  hidden,
  dateTabsClassName,
  value,
  onChange,
}) => {
  if (isEmpty(tabs) || hidden) return null

  const handleOnChange = (id: string) => {
    if (onChange) {
      onChange(id)
    }
  }
  return (
    <div className={classNames(classes.toggleTabsRow, className)}>
      {map(tabs, ({ id, label }) => {
        if (!id) return null
        return (
          <Button
            onClick={() => handleOnChange(id)}
            appearance={AppearanceTypes.Secondary}
            children={label}
            key={id}
            className={classNames(
              classes.toggleTabs,
              dateTabsClassName ? dateTabsClassName : classes.toggleTab,
              value === id && classes.activeToggleTab
            )}
          />
        )
      })}
    </div>
  )
}

export default ToggleTabs
