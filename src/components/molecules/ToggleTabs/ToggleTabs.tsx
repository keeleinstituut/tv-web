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
  activeTab?: string
  setActiveTab?: (id: string) => void
  className?: string
  tabs?: ToggleTab[]
  hidden?: boolean
  dateTabsClassName?: string
}

const ToggleTabs: FC<ToggleTabsProps> = ({
  activeTab,
  className,
  setActiveTab,
  tabs = [],
  hidden,
  dateTabsClassName,
}) => {
  if (isEmpty(tabs) || hidden) return null
  return (
    <div className={classNames(classes.toggleTabsRow, className)}>
      {map(tabs, ({ id, label }) => {
        if (!id) return null
        return (
          <Button
            onClick={() => setActiveTab && setActiveTab(id)}
            appearance={AppearanceTypes.Secondary}
            children={label}
            key={id}
            className={classNames(
              classes.toggleTabs,
              dateTabsClassName ? dateTabsClassName : classes.toggleTab,
              activeTab === id && classes.activeToggleTab
            )}
          />
        )
      })}
    </div>
  )
}

export default ToggleTabs
