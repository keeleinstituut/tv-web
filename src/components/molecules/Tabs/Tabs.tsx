import { FC } from 'react'
import classNames from 'classnames'
import { isEmpty, map } from 'lodash'
import Tab, { TabStyle, TabType } from 'components/molecules/Tab/Tab'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as AddIcon } from 'assets/icons/add.svg'
import classes from './classes.module.scss'

interface ObjectType {
  [key: string]: string
}
interface TabsProps {
  activeTab?: string
  setActiveTab: (id?: string) => void
  className?: string
  tabs: Omit<TabType, 'isActive' | 'onClick' | 'onChangeName'>[]
  onAddPress?: () => void
  addLabel?: string
  addDisabled?: boolean
  onChangeName?: (id: string, newValue: string) => void
  tabNames?: ObjectType
  editDisabled?: boolean
  tabStyle?: TabStyle
}

const Tabs: FC<TabsProps> = ({
  activeTab,
  className,
  setActiveTab,
  tabs = [],
  onAddPress,
  addLabel,
  addDisabled,
  onChangeName,
  tabNames,
  editDisabled,
  tabStyle,
}) => {
  if (isEmpty(tabs)) return null
  return (
    <div
      className={classNames(
        classes.tabsRow,
        tabStyle === TabStyle.Primary && classes.primaryTabsContainer,
        className
      )}
    >
      {map(tabs, ({ id, name }) => {
        if (!id) return null
        return (
          <Tab
            onClick={setActiveTab}
            key={id}
            name={tabNames?.[id] || name}
            id={id}
            isActive={activeTab === id}
            onChangeName={onChangeName}
            editDisabled={editDisabled}
            tabStyle={tabStyle}
          />
        )
      })}
      <Button
        hidden={addDisabled}
        appearance={AppearanceTypes.Text}
        iconPositioning={IconPositioningTypes.Left}
        children={addLabel}
        icon={AddIcon}
        className={classes.addButton}
        onClick={onAddPress}
      />
    </div>
  )
}

export default Tabs
