import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import GeneralPriceListTable from 'components/organisms/tables/GeneralPriceListTable/GeneralPriceListTable'

const GeneralPriceList: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <div>
        <h1>{t('vendors.price_list')}</h1>
      </div>
      <GeneralPriceListTable />
    </>
  )
}

export default GeneralPriceList
