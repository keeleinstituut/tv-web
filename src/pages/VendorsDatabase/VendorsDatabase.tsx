import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { isEmpty, includes } from 'lodash'
import { Root } from '@radix-ui/react-form'
import Loader from 'components/atoms/Loader/Loader'
import useAuth from 'hooks/useAuth'
import VendorsTable from 'components/organisms/tables/VendorsTable/VendorsTable'
import { useVendorsFetch } from 'hooks/requests/useVendors'
import { Privileges } from 'types/privileges'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import classes from './classes.module.scss'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'

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

  const handleOpenVendorsEditModal = useCallback(() => {
    showModal(ModalTypes.VendorsEdit, {})
  }, [])

  return (
    <>
      <div className={classes.vendorsDatabaseHeader}>
        <h1>{t('vendors.vendors_database')}</h1>
        <Tooltip helpSectionKey="vendorsDatabase" />
        <Button
          href="/vendors"
          onClick={handleOpenVendorsEditModal}
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
