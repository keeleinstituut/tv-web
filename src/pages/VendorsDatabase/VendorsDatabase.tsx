import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { isEmpty, includes } from 'lodash'
import classNames from 'classnames'
import { Root } from '@radix-ui/react-form'
import Loader from 'components/atoms/Loader/Loader'
import useAuth from 'hooks/useAuth'
import VendorsTable from 'components/organisms/tables/VendorsTable/VendorsTable'
import { useVendorsFetch } from 'hooks/requests/useVendors'
import { Privileges } from 'types/privileges'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import classes from './classes.module.scss'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

const VendorsDatabase: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const { existingVendors, paginationData, isLoading } = useVendorsFetch()

  console.log({ existingVendors })

  return (
    <>
      <div className={classes.vendorsDatabaseHeader}>
        <h1>{t('vendors.vendors_database')}</h1>
        <Tooltip
          title={t('cheat_sheet.user_management.title')}
          modalContent={<div>TODO: Find the content</div>}
        />
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
        <Button
          href="/settings/users/add"
          hidden={!includes(userPrivileges, Privileges.AddUser)}
        >
          {t('button.add_users')}
        </Button>
      </div>
      <Root>
        <Loader loading={isLoading && isEmpty(existingVendors)} />
        <VendorsTable
          data={existingVendors}
          paginationData={paginationData}
          hidden={isEmpty(existingVendors)}
          handleFilterChange={() => null}
          handleSortingChange={() => null}
          handlePaginationChange={() => null}
        />
      </Root>
    </>
  )
}

export default VendorsDatabase
