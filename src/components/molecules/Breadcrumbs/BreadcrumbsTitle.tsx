import { useMemo } from 'react'
import { useFetchUser } from 'hooks/requests/useUsers'
import { useVendorFetch } from 'hooks/requests/useVendors'
import { BreadcrumbComponentProps } from 'use-react-router-breadcrumbs'
import { useTranslation } from 'react-i18next'
import { useFetchTranslationMemory } from 'hooks/requests/useTranslationMemories'
import { includes } from 'lodash'
import { useFetchOrder } from 'hooks/requests/useOrders'
import { useFetchTask } from 'hooks/requests/useTasks'

interface idTypes {
  vendorId?: string
  userId?: string
  projectId?: string
  memoryId?: string
  taskId?: string
}

const BreadcrumbsTitle = <ParamKey extends string = string>({
  match,
}: BreadcrumbComponentProps<ParamKey>) => {
  const { t } = useTranslation()

  const { vendorId, userId, projectId, memoryId, taskId }: idTypes =
    match?.params

  const { vendor } = useVendorFetch({ id: vendorId })
  const { user } = useFetchUser({ id: userId })
  const { order } = useFetchOrder({ id: projectId })
  const { translationMemory } = useFetchTranslationMemory({
    id: memoryId,
  })
  const { task } = useFetchTask({
    id: taskId,
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
      case !!taskId: {
        return { name: task?.assignment?.ext_id }
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
    taskId,
    vendor?.institution_user?.user.forename,
    vendor?.institution_user?.user.surname,
    user?.user.forename,
    user?.user.surname,
    t,
    order?.ext_id,
    translationMemory?.name,
    task?.assignment?.ext_id,
  ])

  return <span>{includes(name, undefined) ? '' : name}</span>
}

export default BreadcrumbsTitle
