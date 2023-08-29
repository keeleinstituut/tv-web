import Loader from 'components/atoms/Loader/Loader'
import {
  useFetchOrder,
  useFetchSubOrder,
  useSubOrderSendToCat,
} from 'hooks/requests/useOrders'
import { FC, Fragment, useState } from 'react'
import { includes, find, map, chain, assign, filter } from 'lodash'
import { useParams } from 'react-router-dom'
import classes from './classes.module.scss'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import { OrderStatus } from 'types/orders'
import Tag from 'components/atoms/Tag/Tag'
import Tabs from 'components/molecules/Tabs/Tabs'

// TODO: WIP - implement this page

const TaskPage: FC = () => {
  const { t } = useTranslation()
  const { taskId } = useParams()
  // const { order, isLoading } = useFetchOrder({ orderId })
  // const { id, status } = order || {}
  // TODO: check is "Tellija" of the order is current user
  const isPersonalOrder = true
  // if (isLoading) return <Loader loading={isLoading} />
  return (
    <div>
      <div className={classes.titleRow}>
        <h1>{taskId}</h1>
      </div>

      {/* <div>
        <br />
        {map(order?.sub_projects, (subOrder) => {
          return (
            <div key={subOrder.id}>
              <SubOrder id={subOrder.id} />
              <br />
              <br />
              <br />
              <br />
              <br />
            </div>
          )
        })}
      </div> */}
    </div>
  )
}

export default TaskPage

interface ObjectType {
  [key: string]: string
}

const SubOrder: FC<any> = (props) => {
  const { id } = props

  const [tabNames, setTabNames] = useState<ObjectType>({})
  const [activeTab, setActiveTab] = useState<string>()

  const { subOrder, isLoading } = useFetchSubOrder({ id })

  if (isLoading) return <Loader loading={isLoading} />

  const keelesuunad = `${subOrder?.destination_language_classifier_value.value} > ${subOrder?.source_language_classifier_value.value}`

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1>{id}</h1>
        <span>
          keelesuunad: <Tag label={keelesuunad} value />
        </span>
        <span>alamtellimuse ID: {subOrder?.ext_id}</span>
      </div>
      <Tabs
        setActiveTab={setActiveTab}
        tabs={chain((Feature as any).supportedFeatures)
          .filter((feature) =>
            includes(
              ['general_information', ...(subOrder?.features || [])],
              feature
            )
          )
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

      <Feature subOrder={subOrder} feature={activeTab} />

      {/* <pre>
        {JSON.stringify(subOrder, null, 2)}
      </pre> */}
    </>
  )
}

const Feature: FC<any> = (props) => {
  const { subOrder, feature } = props
  let Component = null

  switch (feature) {
    case 'general_information':
      Component = GeneralInformation
      break
    case 'job_translation':
      Component = TranslationFeature
      break
    case 'job_revision':
      Component = RevisionFeature
      break
    case 'job_overview':
      Component = OverviewFeature
      break

    default:
      break
  }

  if (!Component) {
    return <></>
  }

  return <Component {...props} />
}

;(Feature as any).supportedFeatures = [
  'general_information',
  'job_translation',
  'job_revision',
  'job_overview',
]

const GeneralInformation: FC<any> = (props) => {
  const { subOrder, feature } = props
  const catSupported = includes(subOrder.cat_features, feature)
  const { sendToCat } = useSubOrderSendToCat({ id: subOrder.id })

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>feature: {feature}</span>
        <span>catSupported: {String(catSupported)}</span>
        <span>catProjectCreated: {String(subOrder.cat_project_created)}</span>
      </div>
      <br />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h1>Lähtefailid</h1>
          <table>
            <thead>
              <tr>
                <th>Faili nimi</th>
                <th>Viimati uuendatud</th>
              </tr>
            </thead>
            <tbody>
              {map(subOrder.source_files, (file) => {
                return (
                  <tr key={file.id}>
                    <td>{file.file_name}</td>
                    <td>{file.updated_at}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {/* {!subOrder.cat_project_created && (
            <Button
              onClick={() =>
                sendToCat({
                  id: 'asd',
                })
              }
            >
              genereeri tõlkimiseks
            </Button>
          )} */}
        </div>
        <div style={{ flex: 1 }}>
          <h1>Valmisfailid teostajatelt</h1>
          <table>
            <thead>
              <tr>
                <th>Faili nimi</th>
                <th>Viimati uuendatud</th>
              </tr>
            </thead>
            <tbody>
              {map(subOrder.final_files, (file) => {
                return (
                  <tr key={file.id}>
                    <td>{file.file_name}</td>
                    <td>{file.updated_at}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

const TranslationFeature: FC<any> = (props) => {
  const { subOrder, feature } = props
  const catSupported = includes(subOrder.cat_features, feature)
  const featureAssignments = filter(subOrder.assignments, (assignment) => {
    return assignment.feature === feature
  })

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>feature: {feature}</span>
        <span>catSupported: {String(catSupported)}</span>
      </div>
      <br />
      {/* {map(featureAssignments, (assignment, i) => {
        return (
          <Assignment
            key={assignment.id}
            assignment={assignment}
            index={i + 1}
            label="Tõlkimine"
          />
        )
      })} */}
    </>
  )
}

const RevisionFeature: FC<any> = (props) => {
  const { subOrder, feature } = props
  const catSupported = includes(subOrder.cat_features, feature)
  const featureAssignments = filter(subOrder.assignments, (assignment) => {
    return assignment.feature === feature
  })

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>feature: {feature}</span>
        <span>catSupported: {String(catSupported)}</span>
      </div>
      <br />
      {/* {map(featureAssignments, (assignment, i) => {
        return (
          <Assignment
            key={assignment.id}
            assignment={assignment}
            index={i + 1}
            label="Toimetamine"
          />
        )
      })} */}
    </>
  )
}

const OverviewFeature: FC<any> = (props) => {
  const { subOrder, feature } = props
  const catSupported = includes(subOrder.cat_features, feature)
  const featureAssignments = filter(subOrder.assignments, (assignment) => {
    return assignment.feature === feature
  })

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>feature: {feature}</span>
        <span>catSupported: {String(catSupported)}</span>
      </div>
      {/* {map(featureAssignments, (assignment, i) => {
        return (
          <Assignment
            key={assignment.id}
            assignment={assignment}
            index={i + 1}
            label="Ülevaatus"
          />
        )
      })} */}
    </>
  )
}

const Assignment: FC<any> = (props) => {
  const { assignment, index, label } = props

  return (
    <Fragment>
      <h3>
        Teostaja {index} ({label})
      </h3>
      <div
        key={assignment.id}
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span>deadline:</span>
          <span>erijuhised tellimuse kohta:</span>
          <span>maht:</span>
          <span>teostaja märkused:</span>
        </div>
        <div style={{ flex: 1 }}>
          <h1>Teostajad</h1>
          <table>
            <thead>
              <tr>
                <th>Nimi</th>
                <th>Staatus</th>
                <th>Maksumus</th>
              </tr>
            </thead>
            <tbody>
              {map(assignment.candidates, (candidate) => {
                const { institution_user } = candidate.vendor
                const name = `${institution_user.user.forename} ${institution_user.user.surname}`
                let status = '-'
                console.log(
                  '--------------------------------------------------------------------'
                )
                console.log(assignment.assigned_vendor_id)
                console.log(candidate.vendor_id)
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                // TODO: asdasd
                if (!assignment.assignee_id) {
                  status = 'Teostajale edastatud'
                }
                if (assignment.assigned_vendor_id == candidate.vendor_id) {
                  status = 'Teostamisel'
                } else {
                  status = 'Mitte valitud'
                }
                return (
                  <tr key={candidate.id}>
                    <td>{name}</td>
                    <td>{status}</td>
                    <td>{candidate.price}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(!assignment.somethingsomething || true) && (
            <Button
              onClick={() => {
                // Do nothing
              }}
            >
              Saada pakkumus
            </Button>
          )}
          {/* {!subOrder.cat_project_created && (
            <Button onClick={() => {}}>genereeri tõlkimiseks</Button>
          )} */}
        </div>
      </div>
    </Fragment>
  )
}
