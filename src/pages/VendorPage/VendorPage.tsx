import { FC } from 'react'
import { useParams } from 'react-router-dom'
import VendorForm from 'components/organisms/forms/VendorForm/VendorForm'
import { useFetchVendor } from 'hooks/requests/useVendors'
import VendorPriceListForm from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import classes from './classes.module.scss'
import Button from 'components/molecules/Button/Button'
import useAuth from 'hooks/useAuth'
import { includes } from 'lodash'
import { Privileges } from 'types/privileges'
import { useTranslation } from 'react-i18next'

const VendorPage: FC = () => {
  const { t } = useTranslation()
  const { vendorId } = useParams()
  const { userPrivileges } = useAuth()
  const { vendor, isLoading } = useFetchVendor({ id: vendorId })
  const vendorName = `${vendor?.institution_user?.user?.forename} ${vendor?.institution_user?.user?.surname}`

  if (!vendor || isLoading) return null

  return (
    <>
      <div className={classes.titleRow}>
        <h1 className={classes.title}>{vendorName}</h1>

        <Button
          children={t('button.vendor_tasks')}
          href={`/vendors/${vendor.id}/${vendor.institution_user.id}`}
          hidden={!includes(userPrivileges, Privileges.ViewVendorTask)}
        />
      </div>

      <VendorForm vendor={vendor} />
      <VendorPriceListForm vendor={vendor} />
    </>
  )
}

export default VendorPage
