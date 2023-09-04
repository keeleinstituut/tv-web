import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { isEmpty, includes } from 'lodash'
import { Root } from '@radix-ui/react-form'
import Loader from 'components/atoms/Loader/Loader'
import useAuth from 'hooks/useAuth'
import VendorsTable from 'components/organisms/tables/VendorsTable/VendorsTable'
import { useVendorsFetch } from 'hooks/requests/useVendors'
import { Privileges } from 'types/privileges'
import VendorManagementCheatSheet from 'components/molecules/cheatSheets/VendorManagementCheatSheet'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import classes from './classes.module.scss'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

const VendorsDatabase: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const {
    vendors,
    paginationData,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useVendorsFetch()

  return (
    <>
      <div className={classes.vendorsDatabaseHeader}>
        <h1>{t('vendors.vendors_database')}</h1>
        <Tooltip
          title={t('cheat_sheet.vendor_management.title')}
          modalContent={<VendorManagementCheatSheet />}
          helpSectionKey=""
        />
        <Button
          href="/vendors"
          appearance={AppearanceTypes.Secondary}
          hidden={!includes(userPrivileges, Privileges.EditVendorDb)}
        >
          {t('label.add_remove_vendor')}
        </Button>
        {/* <Button
        appearance={AppearanceTypes.Secondary}
        className={classNames({
          [classes.invisible]: !includes(userPrivileges, 'EXPORT_USER'),
        })}
        onClick={handleDownloadFile}
        disabled={!includes(userPrivileges, 'EXPORT_USER')}
        loading={isLoading}
      >
        {t('button.export_csv')}
      </Button> */}
      </div>
      <Root>
        <Loader loading={isLoading && isEmpty(vendors)} />
        <VendorsTable
          data={vendors}
          hidden={isEmpty(vendors)}
          {...{
            paginationData,
            handleFilterChange,
            handleSortingChange,
            handlePaginationChange,
          }}
        />
      </Root>
    </>
  )
}

export default VendorsDatabase
