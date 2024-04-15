import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { includes } from 'lodash'
import { useAuth } from 'components/contexts/AuthContext'
import VendorsTable from 'components/organisms/tables/VendorsTable/VendorsTable'
import { Privileges } from 'types/privileges'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import classes from './classes.module.scss'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'

const VendorsDatabase: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const handleOpenVendorsEditModal = useCallback(() => {
    showModal(ModalTypes.VendorsEdit, {})
  }, [])

  return (
    <>
      <div className={classes.vendorsDatabaseHeader}>
        <h1>{t('vendors.vendors_database')}</h1>
        <Tooltip helpSectionKey="vendorsDatabase" />
        <Button
          onClick={handleOpenVendorsEditModal}
          appearance={AppearanceTypes.Secondary}
          hidden={!includes(userPrivileges, Privileges.EditVendorDb)}
        >
          {t('label.add_remove_vendor')}
        </Button>
        <Button
          href="/vendors/price-list"
          hidden={!includes(userPrivileges, Privileges.ViewGeneralPricelist)}
        >
          {t('label.view_general_price_list')}
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
      <VendorsTable />
    </>
  )
}

export default VendorsDatabase
