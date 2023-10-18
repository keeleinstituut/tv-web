import { FC, useState } from 'react'
import TasksTable from 'components/organisms/tables/TasksTable/TasksTable'
import { chain } from 'lodash'
import Tabs from 'components/molecules/Tabs/Tabs'
import { TabStyle } from 'components/molecules/Tab/Tab'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

import classes from './classes.module.scss'

// TODO: WIP - implement this page

interface ObjectType {
  [key: string]: string
}

const MyTasks: FC = () => {
  const { t } = useTranslation()

  const [tabNames, setTabNames] = useState<ObjectType>({})
  const [activeTab, setActiveTab] = useState<string>()

  let Component: FC = () => null
  switch (activeTab) {
    case 'Minu ülesanded':
      Component = TasksTable
      break
  }

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('my_tasks.title')}</h1>
        <Tooltip helpSectionKey="myTasks" />
      </div>

      <Tabs
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        tabStyle={TabStyle.Primary}
        tabs={chain([
          'Minu ülesanded',
          'Ootel ülesanded',
          'Minu ülesannete ajalugu',
        ])
          .map((feature) => ({
            id: feature,
            name: feature,
          }))
          .value()}
        onAddPress={function (): void {
          throw new Error('Function not implemented.')
        }}
        addLabel={''}
        onChangeName={function (id: string, newValue: string): void {
          throw new Error('Function not implemented.')
        }}
        addDisabled
        tabNames={tabNames}
        className={classes.tabsContainer}
        editDisabled
      />

      <Component />
    </>
  )
}

export default MyTasks
