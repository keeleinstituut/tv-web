import { useState, FC, PropsWithChildren, useCallback, useEffect } from 'react'
import classes from './classes.module.scss'
import { useFetchSubOrder, useSubOrderWorkflow } from 'hooks/requests/useOrders'
import Tag from 'components/atoms/Tag/Tag'
import Loader from 'components/atoms/Loader/Loader'
import Tabs from 'components/molecules/Tabs/Tabs'
import Feature from 'components/organisms/features/Feature'
import { compact, includes, map, toLower, find, findIndex } from 'lodash'
import { ListSubOrderDetail, SubProjectFeatures } from 'types/orders'
import { useTranslation } from 'react-i18next'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import classNames from 'classnames'
import OrderStatusTag from 'components/molecules/OrderStatusTag/OrderStatusTag'
import dayjs from 'dayjs'
import Notification, {
  NotificationTypes,
} from 'components/molecules/Notification/Notification'
import { TabStyle } from 'components/molecules/Tab/Tab'
import useHashState from 'hooks/useHashState'
import Button from 'components/molecules/Button/Button'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'

// TODO: this is WIP code for suborder view

// interface ObjectType {
//   [key: string]: string
// }

interface ColumnProps {
  label?: string
}

const Column: FC<PropsWithChildren<ColumnProps>> = ({ label, children }) => (
  <div className={classes.column}>
    <span className={classes.label}>{label}</span>
    {children}
  </div>
)

interface LeftComponentProps {
  languageDirection?: string
  ext_id: string
  price?: string
  deadline_at?: string
}

const LeftComponent: FC<LeftComponentProps> = ({
  languageDirection,
  ext_id,
  price,
  deadline_at,
}) => {
  const { t } = useTranslation()
  return (
    <>
      <Column label={t('label.language_direction')}>
        <Tag label={languageDirection || '-'} value />
      </Column>
      <Column label={t('label.sub_order_id')}>
        <span className={classes.valueText}>{ext_id}</span>
      </Column>
      <Column label={t('label.cost')}>
        <span className={classes.boldValueText}>{price || '-'}</span>
      </Column>
      <Column label={t('label.deadline_at')}>
        <span className={classes.valueText}>
          {deadline_at ? dayjs(deadline_at).format('DD.MM.YYYY HH:mm') : '-'}
        </span>
      </Column>
    </>
  )
}

type SubOrderProps = Pick<
  ListSubOrderDetail,
  | 'id'
  | 'ext_id'
  | 'source_language_classifier_value'
  | 'destination_language_classifier_value'
  | 'price'
  | 'status'
  | 'deadline_at'
> & {
  projectDeadline?: string
}

const SubOrderSection: FC<SubOrderProps> = ({
  id,
  ext_id,
  source_language_classifier_value,
  destination_language_classifier_value,
  price,
  status,
  projectDeadline,
  deadline_at,
}) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string | undefined>(
    SubProjectFeatures.GeneralInformation
  )
  const { setHash, currentHash } = useHashState()
  const [isExpanded, setIsExpanded] = useState(includes(currentHash, ext_id))
  const { subOrder, isLoading } = useFetchSubOrder({ id }) || {}

  console.log('subOrder', subOrder)

  const { startSubOrderWorkflow, isLoading: isStartingWorkflow } =
    useSubOrderWorkflow({ id })

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

  const { assignments = [] } = subOrder || {}

  const languageDirection = `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`

  const hasAnyUnassignedFeatures = !find(
    assignments,
    ({ assignee }) => !assignee
  )

  const tabs = map(
    assignments,
    (assignment) => assignment.job_definition.job_key
  )

  const handleOpenContainer = useCallback(
    (isExpanded: boolean) => {
      setHash(isExpanded ? ext_id : '')
      setIsExpanded(isExpanded)
    },
    [ext_id, setHash]
  )

  const handleStartWorkflow = useCallback(async () => {
    try {
      await startSubOrderWorkflow()
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.workflow_started'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [startSubOrderWorkflow, t])

  // TODO: not sure if GeneralInformation should be considered a feature here or just added
  const availableTabs = compact(
    map(tabs, (feature) => {
      if (feature) {
        return {
          id: feature,
          // TODO: need to add (CAT) to end of some feature names
          name: `${t(`orders.features.${feature}`)}`,
        }
      }
    })
  )

  const allTabs = [
    {
      id: 'general_information',
      name: t('orders.features.general_information'),
    },
    ...availableTabs,
  ]

  if (isLoading) return <Loader loading={isLoading} />

  return (
    <ExpandableContentContainer
      className={classNames(
        classes.expandableContainer,
        status && classes[toLower(status)]
      )}
      onExpandedChange={handleOpenContainer}
      id={ext_id}
      isExpanded={isExpanded}
      rightComponent={<OrderStatusTag status={status} />}
      wrapContent
      bottomComponent={
        <>
          <Notification
            content={t('warning.sub_order_tasks_missing_vendors')}
            type={NotificationTypes.Warning}
            className={classes.notificationStyle}
            hidden={!hasAnyUnassignedFeatures || isExpanded}
          />
          <Notification
            content={t('warning.send_sub_project_to_vendor_warning')}
            hideIcon
            type={
              hasAnyUnassignedFeatures
                ? NotificationTypes.Warning
                : NotificationTypes.Info
            }
            className={classNames(
              classes.notificationStyle,
              classes.startWorkFlowNotification,
              hasAnyUnassignedFeatures && classes.warning
            )}
            hidden={!isExpanded}
            children={
              <Button
                children={t('button.send_sub_project_to_vendors')}
                disabled={!!hasAnyUnassignedFeatures}
                loading={isStartingWorkflow}
                onClick={handleStartWorkflow}
              />
            }
          />
        </>
      }
      leftComponent={
        <LeftComponent {...{ ext_id, deadline_at, price, languageDirection }} />
      }
    >
      <Tabs
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        tabs={allTabs}
        tabStyle={TabStyle.Primary}
        className={classes.tabsContainer}
        addDisabled
        editDisabled
      />

      <Feature
        subOrder={subOrder}
        projectDeadline={projectDeadline}
        feature={activeTab as SubProjectFeatures}
        index={findIndex(allTabs, (tab) => {
          return tab.id === activeTab
        })}
      />
    </ExpandableContentContainer>
  )
}

export default SubOrderSection
