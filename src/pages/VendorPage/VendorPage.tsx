import { FC } from 'react'
import { useParams } from 'react-router-dom'
import VendorForm from 'components/organisms/forms/VendorForm/VendorForm'
import { useVendorsFetch } from 'hooks/requests/useVendors'
import { Vendor } from 'types/vendors'
import VendorPriceListForm from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'

const VendorPage: FC = () => {
  const { vendorId } = useParams()
  const { vendors, isLoading } = useVendorsFetch() // TODO: replace with single vendor fetch when available

  const vendor = vendors?.find(({ id }) => id === vendorId) as Vendor

  if (!vendor || isLoading) return null

  return (
    <>
      <VendorForm vendor={vendor} />
      {/* <VendorPriceListForm vendor={vendor} /> */}
    </>
  )
}

export default VendorPage
