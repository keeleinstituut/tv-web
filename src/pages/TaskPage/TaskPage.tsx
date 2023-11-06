import Loader from 'components/atoms/Loader/Loader'
import {
  useFetchOrder,
  useFetchSubOrder,
  useSubOrderSendToCat,
} from 'hooks/requests/useOrders'
import { FC, Fragment, useCallback, useEffect, useState } from 'react'
import {
  includes,
  find,
  map,
  chain,
  assign,
  filter,
  toLower,
  findIndex,
} from 'lodash'
import { useParams } from 'react-router-dom'
import classes from './classes.module.scss'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import { OrderStatus } from 'types/orders'
import Tag from 'components/atoms/Tag/Tag'
import Tabs from 'components/molecules/Tabs/Tabs'
import OrderDetails, {
  OrderDetailModes,
} from 'components/organisms/OrderDetails/OrderDetails'
import GeneralInformationFeature from 'components/organisms/features/GeneralInformationFeature/GeneralInformationFeature'
import { ClassifierValueType } from 'types/classifierValues'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import classNames from 'classnames'
import useHashState from 'hooks/useHashState'
import OrderStatusTag from 'components/molecules/OrderStatusTag/OrderStatusTag'
import { LeftComponent } from 'components/templates/SubOrderSection/SubOrderSection'

// TODO: WIP - implement this page

const TaskPage: FC = () => {
  const { t } = useTranslation()
  const { taskId } = useParams()
  const { order, isLoading } = useFetchOrder({
    id: '9a860cf8-2cbe-4467-9ac9-41acf1cab16c',
  })

  console.log('order', order)
  const { id, status } = order || {}
  // TODO: check is "Tellija" of the order is current user
  const isPersonalOrder = true
  if (isLoading) return <Loader loading={isLoading} />
  return (
    <div>
      <div className={classes.titleRow}>
        <h1>{taskId}</h1>
      </div>

      <OrderDetails
        mode={OrderDetailModes.Editable}
        order={order}
        className={classes.orderDetails}
      />

      <div>
        <br />
        {map(order?.sub_projects, (subOrder) => {
          console.log('subOrder', subOrder)
          return (
            <div key={subOrder.id}>
              <SubOrder
                id={subOrder.id}
                ext_id={subOrder.ext_id}
                status={order?.status}
                deadline_at={subOrder.deadline_at}
                price={order?.price}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TaskPage

interface ObjectType {
  [key: string]: string
}

const SubOrder: FC<any> = ({ id, ext_id, status, deadline_at, price }) => {
  const { t } = useTranslation()

  const [tabNames, setTabNames] = useState<ObjectType>({})
  // const [activeTab, setActiveTab] = useState<string>()

  const { setHash, currentHash } = useHashState()
  const [isExpanded, setIsExpanded] = useState(includes(currentHash, ext_id))

  const { subOrder, isLoading } = useFetchSubOrder({ id })

  const languageDirection = `${subOrder?.destination_language_classifier_value.value} > ${subOrder?.source_language_classifier_value.value}`

  const activeTab = 'job_revision'

  const allTabs = [
    {
      id: 'general_information',
      name: t('orders.features.general_information'),
    },
  ]

  const attemptScroll = useCallback(() => {
    const matchingElement = document.getElementById(ext_id)
    if (matchingElement && !isLoading) {
      matchingElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else if (matchingElement && isLoading) setTimeout(attemptScroll, 300)
  }, [ext_id, isLoading])

  useEffect(() => {
    if (currentHash && includes(currentHash, ext_id)) {
      attemptScroll()
      if (!isExpanded) {
        setIsExpanded(true)
      }
    }
  }, [currentHash, ext_id, attemptScroll, isExpanded])

  const handleOpenContainer = useCallback(
    (isExpanded: boolean) => {
      setHash(isExpanded ? ext_id : '')
      setIsExpanded(isExpanded)
    },
    [ext_id, setHash]
  )

  if (isLoading) return <Loader loading={isLoading} />

  return (
    <>
      {/* <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1>{id}</h1>
        <span>
          {t('label.language_direction')}
          <Tag label={languageDirection} value />
        </span>
        <span>alamtellimuse ID: {subOrder?.ext_id}</span>
      </div> */}

      <ExpandableContentContainer
        className={classNames(
          classes.expandableContainer
          // status && classes[toLower(status)]
        )}
        onExpandedChange={handleOpenContainer}
        id={ext_id}
        isExpanded={isExpanded}
        rightComponent={<OrderStatusTag status={status} />}
        wrapContent
        leftComponent={
          <LeftComponent
            {...{ ext_id, deadline_at, price, languageDirection }}
          />
        }
      >
        <GeneralInformationFeature
          deadline_at={''}
          source_files={[]}
          cat_files={[]}
          cat_jobs={[]}
          cat_analyzis={[]}
          final_files={[]}
          source_language_classifier_value={{
            id: '123',
            type: ClassifierValueType.Language,
            value: 'bu',
            name: 'bubu',
            synced_at: null,
            deleted_at: null,
            project_type_config: {
              id: '',
              workflow_process_definition_id: '',
              created_at: '',
              updated_at: '',
              type_classifier_value_id: '',
              is_start_date_supported: false,
              cat_tool_enabled: false,
              job_definitions: [],
            },
          }}
          destination_language_classifier_value={{
            id: '123',
            type: ClassifierValueType.Language,
            value: 'bu',
            name: 'bubu',
            synced_at: null,
            deleted_at: null,
            project_type_config: {
              id: '',
              workflow_process_definition_id: '',
              created_at: '',
              updated_at: '',
              type_classifier_value_id: '',
              is_start_date_supported: false,
              cat_tool_enabled: false,
              job_definitions: [],
            },
          }}
          subOrderId={''}
        />
      </ExpandableContentContainer>
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

  return <></>
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
  const { sendToCat } = useSubOrderSendToCat()

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
      {map(featureAssignments, (assignment, i) => {
        return (
          <Assignment
            key={assignment.id}
            assignment={assignment}
            index={i + 1}
            label="Tõlkimine"
          />
        )
      })}
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
      {map(featureAssignments, (assignment, i) => {
        return (
          <Assignment
            key={assignment.id}
            assignment={assignment}
            index={i + 1}
            label="Toimetamine"
          />
        )
      })}
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
      {map(featureAssignments, (assignment, i) => {
        return (
          <Assignment
            key={assignment.id}
            assignment={assignment}
            index={i + 1}
            label="Ülevaatus"
          />
        )
      })}
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
