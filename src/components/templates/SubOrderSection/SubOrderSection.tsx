import { useState, FC, PropsWithChildren, useCallback, useEffect } from 'react'
import classes from './classes.module.scss'
import { useFetchSubOrder } from 'hooks/requests/useOrders'
import Tag from 'components/atoms/Tag/Tag'
import Loader from 'components/atoms/Loader/Loader'
import Tabs from 'components/molecules/Tabs/Tabs'
import Feature from 'components/organisms/features/Feature'
import {
  compact,
  includes,
  map,
  toLower,
  find,
  filter,
  findIndex,
} from 'lodash'
import {
  ListSubOrderDetail,
  SubOrderStatus,
  SubProjectFeatures,
} from 'types/orders'
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
  cost?: string
  deadline_at?: string
}

const LeftComponent: FC<LeftComponentProps> = ({
  languageDirection,
  ext_id,
  cost,
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
        <span className={classes.boldValueText}>{cost || '-'}</span>
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
  | 'cost'
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
  cost,
  status = SubOrderStatus.Registered,
  projectDeadline,
  deadline_at,
}) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string | undefined>(
    SubProjectFeatures.GeneralInformation
  )
  const { subOrder, isLoading } = useFetchSubOrder({ id }) || {}
  const { setHash, currentHash } = useHashState()

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
    }
  }, [currentHash, ext_id, attemptScroll])

  const { features = [], assignments = [] } = subOrder || {}

  const languageDirection = `${destination_language_classifier_value?.value} > ${source_language_classifier_value?.value}`

  // TODO: possibly we can just check the entire assignments list and see if any of them has no assigned_vendor_id
  // However not sure right now, if the "assignments" list will contain entries for unassigned tasks
  const hasAnyUnassignedFeatures = find(features, (feature) => {
    const correspondingAssignments = filter(assignments, { feature })
    // TODO: potentially also have to return true, if correspondingAssignments is empty
    return find(
      correspondingAssignments,
      ({ assigned_vendor_id }) => !assigned_vendor_id
    )
  })

  const handleOpenContainer = useCallback(
    (isExpanded: boolean) => {
      setHash(isExpanded ? ext_id : '')
    },
    [ext_id, setHash]
  )

  // TODO: not sure if GeneralInformation should be considered a feature here or just added
  const availableTabs = compact(
    map(features, (feature) => {
      if (feature) {
        return {
          id: feature,
          // TODO: need to add (CAT) to end of some feature names
          name: `${t(`orders.features.${feature}`)}`,
        }
      }
    })
  )

  if (isLoading) return <Loader loading={isLoading} />

  return (
    <ExpandableContentContainer
      className={classNames(
        classes.expandableContainer,
        status && classes[toLower(status)]
      )}
      onExpandedChange={handleOpenContainer}
      id={ext_id}
      isExpanded={includes(currentHash, ext_id)}
      rightComponent={<OrderStatusTag status={status} />}
      wrapContent
      bottomComponent={
        <Notification
          content={t('warning.sub_order_tasks_missing_vendors')}
          type={NotificationTypes.Warning}
          className={classes.notificationStyle}
          hidden={!hasAnyUnassignedFeatures}
        />
      }
      leftComponent={
        <LeftComponent {...{ ext_id, deadline_at, cost, languageDirection }} />
      }
    >
      <Tabs
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        tabs={availableTabs}
        tabStyle={TabStyle.Primary}
        className={classes.tabsContainer}
        addDisabled
        editDisabled
      />

      <Feature
        subOrder={subOrder}
        projectDeadline={projectDeadline}
        feature={activeTab as SubProjectFeatures}
        index={findIndex(availableTabs, (tab) => {
          return tab.id === activeTab
        })}
      />
    </ExpandableContentContainer>
  )
}

export default SubOrderSection
