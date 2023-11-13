import { useMemo } from 'react'
import { useFetchUser } from 'hooks/requests/useUsers'
import { useVendorFetch } from 'hooks/requests/useVendors'
import { BreadcrumbComponentProps } from 'use-react-router-breadcrumbs'
import { useTranslation } from 'react-i18next'
import { useFetchTranslationMemory } from 'hooks/requests/useTranslationMemories'
import { includes } from 'lodash'

interface idTypes {
  vendorId?: string
  userId?: string
  orderId?: string
  memoryId?: string
}

const BreadcrumbsTitle = <ParamKey extends string = string>({
  match,
}: BreadcrumbComponentProps<ParamKey>) => {
  const { t } = useTranslation()

  const { vendorId, userId, orderId, memoryId }: idTypes = match?.params

  const { vendor } = useVendorFetch({ id: vendorId })
  const { user } = useFetchUser({ id: userId })
  const { translationMemory } = useFetchTranslationMemory({
    id: memoryId,
  })

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
      case !!memoryId: {
        return { name: translationMemory?.name }
      }
      default: {
        return {}
      }
    }
  }, [orderId, t, user, userId, vendor, vendorId, memoryId, translationMemory])

  return <span>{includes(name, undefined) ? '' : name}</span>
}

export default BreadcrumbsTitle
