import { FC } from 'react'
import { useParams } from 'react-router-dom'
import VendorForm from 'components/organisms/forms/VendorForm/VendorForm'
import { useVendorFetch } from 'hooks/requests/useVendors'
import VendorPriceListForm from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'

const VendorPage: FC = () => {
  const { vendorId } = useParams()

  const { vendor, isLoading } = useVendorFetch({ id: vendorId })

  if (!vendor || isLoading) return null

  return (
    <>
      <VendorForm vendor={vendor} />
      <VendorPriceListForm vendor={vendor} />
    </>
  )
}

export default VendorPage
