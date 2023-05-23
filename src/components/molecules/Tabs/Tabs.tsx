import { FC } from 'react'
import classNames from 'classnames'
import { map } from 'lodash'
import Tab, { TabType } from 'components/molecules/Tab/Tab'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as AddIcon } from 'assets/icons/add.svg'
import classes from './styles.module.scss'

interface ObjectType {
  [key: string]: string
}
interface TabsProps {
  activeTab?: string
  setActiveTab: (id?: string) => void
  className?: string
  tabs: Omit<TabType, 'isActive' | 'onClick' | 'onChangeName'>[]
  onAddPress: () => void
  addLabel: string
  addDisabled?: boolean
  onChangeName: (id: string, newValue: string) => void
  tabNames: ObjectType
}

const Tabs: FC<TabsProps> = ({
  activeTab,
  className,
  setActiveTab,
  tabs,
  onAddPress,
  addLabel,
  addDisabled,
  onChangeName,
  tabNames,
}) => {
  return (
    <div className={classNames(classes.tabsRow, className)}>
      {map(tabs, ({ id, name }) => {
        if (!id) return null
        return (
          <Tab
            onClick={setActiveTab}
            key={id}
            name={tabNames[id] || name}
            id={id}
            isActive={activeTab === id}
            onChangeName={onChangeName}
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
