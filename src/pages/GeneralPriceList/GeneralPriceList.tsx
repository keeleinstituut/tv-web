import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import GeneralPriceListTable from 'components/organisms/tables/GeneralPriceListTable/GeneralPriceListTable'
import classes from './classes.module.scss'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

const GeneralPriceList: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('vendors.price_list')}</h1>
        <Tooltip helpSectionKey="priceList" />
      </div>
      <GeneralPriceListTable />
    </>
  )
}

export default GeneralPriceList
