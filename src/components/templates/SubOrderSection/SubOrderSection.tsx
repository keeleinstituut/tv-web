import { useState, FC } from 'react'
import classes from './classes.module.scss'
import { useFetchSubOrder } from 'hooks/requests/useOrders'
import Tag from 'components/atoms/Tag/Tag'
import Loader from 'components/atoms/Loader/Loader'
import Tabs from 'components/molecules/Tabs/Tabs'
import Feature from 'components/organisms/features/Feature'
import { compact, includes, map } from 'lodash'
import { SubProjectFeatures } from 'types/orders'
import { useTranslation } from 'react-i18next'

// interface ObjectType {
//   [key: string]: string
// }

interface SubOrderProps {
  id: string
}

const SubOrderSection: FC<SubOrderProps> = (props) => {
  const { id } = props
  const { t } = useTranslation()

  const [tabNames, setTabNames] = useState({})
  const [activeTab, setActiveTab] = useState<string>()

  const { subOrder, isLoading } = useFetchSubOrder({ id }) || {}
  const { features = [] } = subOrder || {}

  if (isLoading) return <Loader loading={isLoading} />

  const keelesuunad = `${subOrder?.destination_language_classifier_value.value} > ${subOrder?.source_language_classifier_value.value}`

  const availableTabs = compact(
    map(SubProjectFeatures, (feature) => {
      if (
        feature === SubProjectFeatures.GeneralInformation ||
        includes(features, feature)
      ) {
        return {
          id: feature,
          name: t(`orders.features.${feature}`),
        }
      }
    })
  )

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1>{id}</h1>
        <span>
          keelesuunad: <Tag label={keelesuunad} value />
        </span>
        <span>alamtellimuse ID: {subOrder?.ext_id}</span>
        <span style={{ color: 'red' }}>maksumus: {'// TODO: '}</span>
        <span style={{ color: 'red' }}>tähtaeg: {'// TODO: '}</span>
      </div>
      <Tabs
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

      <Feature subOrder={subOrder} feature={activeTab as SubProjectFeatures} />

      {/* <pre>
        {JSON.stringify(subOrder, null, 2)}
      </pre> */}
    </>
  )
}

export default SubOrderSection
