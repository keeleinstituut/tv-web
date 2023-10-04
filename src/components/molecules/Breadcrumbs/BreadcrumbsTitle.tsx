import { useMemo } from 'react'
import { useFetchUser } from 'hooks/requests/useUsers'
import { useVendorFetch } from 'hooks/requests/useVendors'
import { BreadcrumbComponentProps } from 'use-react-router-breadcrumbs'
import { useTranslation } from 'react-i18next'

interface idTypes {
  vendorId?: string
  userId?: string
  orderId?: string
}

const BreadcrumbsTitle = <ParamKey extends string = string>({
  match,
}: BreadcrumbComponentProps<ParamKey>) => {
  const { t } = useTranslation()

  const { vendorId, userId, orderId }: idTypes = match?.params

  const { vendor } = useVendorFetch({ id: vendorId })
  const { user } = useFetchUser({ id: userId })

  const { name } = useMemo(() => {
    switch (true) {
      case !!vendorId: {
        return {
          name: `${vendor?.institution_user?.user.forename} ${vendor?.institution_user?.user.surname}`,
        }
      }
      case !!userId: {
        return { name: `${user?.user.forename} ${user?.user.surname}` }
      }
      case !!orderId: {
        return { name: `${t('orders.order')} ${orderId}` }
      }
      default: {
        return {}
      }
    }
  }, [orderId, t, user, userId, vendor, vendorId])

  return <span>{name}</span>
}

export default BreadcrumbsTitle
