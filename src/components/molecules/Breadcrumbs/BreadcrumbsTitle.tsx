import { useMemo } from 'react'
import { useFetchUser } from 'hooks/requests/useUsers'
import { useVendorFetch } from 'hooks/requests/useVendors'
import { BreadcrumbComponentProps } from 'use-react-router-breadcrumbs'
import { useTranslation } from 'react-i18next'
import { useFetchTranslationMemory } from 'hooks/requests/useTranslationMemories'
import { includes } from 'lodash'
import { useFetchOrder } from 'hooks/requests/useOrders'

interface idTypes {
  vendorId?: string
  userId?: string
  projectId?: string
  memoryId?: string
}

const BreadcrumbsTitle = <ParamKey extends string = string>({
  match,
}: BreadcrumbComponentProps<ParamKey>) => {
  const { t } = useTranslation()

  const { vendorId, userId, projectId, memoryId }: idTypes = match?.params

  const { vendor } = useVendorFetch({ id: vendorId })
  const { user } = useFetchUser({ id: userId })
  const { order } = useFetchOrder({ id: projectId })
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
      case !!projectId: {
        return { name: `${t('orders.order')} [${order?.ext_id}]` }
      }
      case !!memoryId: {
        return { name: translationMemory?.name }
      }
      default: {
        return {}
      }
    }
  }, [
    vendorId,
    userId,
    projectId,
    memoryId,
    vendor?.institution_user?.user.forename,
    vendor?.institution_user?.user.surname,
    user?.user.forename,
    user?.user.surname,
    t,
    order?.ext_id,
    translationMemory?.name,
  ])

  return <span>{includes(name, undefined) ? '' : name}</span>
}

export default BreadcrumbsTitle
