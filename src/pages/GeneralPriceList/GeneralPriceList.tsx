import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Root } from '@radix-ui/react-form'
import classes from './classes.module.scss'

const GeneralPriceList: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className={classes.vendorsDatabaseHeader}>
        <h1>{t('vendors.price_list')}</h1>
      </div>
      <Root>
        {/* <Loader loading={isLoading && isEmpty(vendors)} /> */}
        {/* <VendorsTable
          data={vendors}
          hidden={isEmpty(vendors)}
          {...{
            paginationData,
            handleFilterChange,
            handleSortingChange,
            handlePaginationChange,
          }}
        /> */}
      </Root>
    </>
  )
}

export default GeneralPriceList
