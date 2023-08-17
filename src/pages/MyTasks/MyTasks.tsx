import { FC, useState } from 'react'
import classes from './classes.module.scss'
import TasksTable from 'components/organisms/tables/TasksTable/TasksTable'
import { chain } from 'lodash'
import Tabs from 'components/molecules/Tabs/Tabs'

// TODO: WIP - implement this page

interface ObjectType {
  [key: string]: string
}

const MyTasks: FC = () => {
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
        <h1>My Tasks</h1>
        {/* TODO: add tooltip */}
      </div>
      <Tabs
        setActiveTab={setActiveTab}
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
        addDisabled={true}
        tabNames={tabNames}
      />

      <Component />
    </>
  )
}

export default MyTasks
