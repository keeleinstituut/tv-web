import { useState, FC, PropsWithChildren } from 'react'
import classes from './classes.module.scss'
import { useFetchSubOrder } from 'hooks/requests/useOrders'
import Tag from 'components/atoms/Tag/Tag'
import Loader from 'components/atoms/Loader/Loader'
import Tabs from 'components/molecules/Tabs/Tabs'
import Feature from 'components/organisms/features/Feature'
import { compact, includes, map } from 'lodash'
import { ListSubOrderDetail, SubProjectFeatures } from 'types/orders'
import { useTranslation } from 'react-i18next'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import classNames from 'classnames'
import OrderStatusTag from 'components/molecules/OrderStatusTag/OrderStatusTag'
import dayjs from 'dayjs'
import Notification, {
  NotificationTypes,
} from 'components/molecules/Notification/Notification'

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

type SubOrderProps = Pick<
  ListSubOrderDetail,
  | 'id'
  | 'ext_id'
  | 'source_language_classifier_value'
  | 'destination_language_classifier_value'
  | 'cost'
  | 'status'
  | 'deadline_at'
>

const SubOrderSection: FC<SubOrderProps> = ({
  id,
  ext_id,
  source_language_classifier_value,
  destination_language_classifier_value,
  cost,
  status,
  deadline_at,
}) => {
  const { t } = useTranslation()

  const [tabNames, setTabNames] = useState({})
  const [activeTab, setActiveTab] = useState<string>()

  // const { subOrder, isLoading } = useFetchSubOrder({ id }) || {}
  // const { features = [] } = subOrder || {}

  // if (isLoading) return <Loader loading={isLoading} />

  const languageDirection = `${destination_language_classifier_value?.value} > ${source_language_classifier_value?.value}`

  // const availableTabs = compact(
  //   map(SubProjectFeatures, (feature) => {
  //     if (
  //       feature === SubProjectFeatures.GeneralInformation ||
  //       includes(features, feature)
  //     ) {
  //       return {
  //         id: feature,
  //         name: t(`orders.features.${feature}`),
  //       }
  //     }
  //   })
  // )

  return (
    <ExpandableContentContainer
      className={classNames(
        classes.expandableContainer,
        status && classes[status]
      )}
      rightComponent={<OrderStatusTag status={status} />}
      bottomComponent={
        <Notification
          content={'Alamtellimuses on ülesandeid millel puudub teostaja'}
          type={NotificationTypes.Warning}
          className={classes.notificationStyle}
        />
      }
      leftComponent={
        <>
          <Column label={t('label.language_direction')}>
            <Tag label={languageDirection} value />
          </Column>
          <Column label={t('label.sub_order_id')}>
            <span className={classes.valueText}>{ext_id}</span>
          </Column>
          <Column label={t('label.cost')}>
            <span className={classes.boldValueText}>{cost || '-'}</span>
          </Column>
          <Column label={t('label.deadline_at')}>
            <span className={classes.valueText}>
              {deadline_at
                ? dayjs(deadline_at).format('DD.MM.YYYY HH:mm')
                : '-'}
            </span>
          </Column>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1>{id}</h1>
        {/* <span>
          keelesuunad: <Tag label={keelesuunad} value />
        </span> */}
        <span>alamtellimuse ID: {ext_id}</span>
        <span style={{ color: 'red' }}>maksumus: {'// TODO: '}</span>
        <span style={{ color: 'red' }}>tähtaeg: {'// TODO: '}</span>
      </div>
      {/* <Tabs
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        tabs={availableTabs}
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

      <Feature subOrder={subOrder} feature={activeTab as SubProjectFeatures} /> */}

      {/* <pre>
        {JSON.stringify(subOrder, null, 2)}
      </pre> */}
    </ExpandableContentContainer>
  )
}

export default SubOrderSection
