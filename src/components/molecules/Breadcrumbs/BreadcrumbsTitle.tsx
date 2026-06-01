import { useMemo } from 'react'
import { useFetchUser } from 'hooks/requests/useUsers'
import { useFetchVendor } from 'hooks/requests/useVendors'
import { BreadcrumbComponentProps } from 'use-react-router-breadcrumbs'
import { useTranslation } from 'react-i18next'
import { useFetchTranslationMemory } from 'hooks/requests/useTranslationMemories'
import { includes } from 'lodash'
import { useFetchHistoryTask, useFetchTask } from 'hooks/requests/useTasks'
import { useFetchProject } from 'hooks/requests/useProjects'
import { useFetchOutsourceOffer } from 'hooks/requests/useProjectRequests'
import { useFetchInstitutionPartner } from 'hooks/requests/useInstitutionPartners'

interface idTypes {
  vendorId?: string
  userId?: string
  projectId?: string
  memoryId?: string
  taskId?: string
  isHistoryView?: string
  offerId?: string
  institutionPartnerId?: string
}

const BreadcrumbsTitle = <ParamKey extends string = string>({
  match,
}: BreadcrumbComponentProps<ParamKey>) => {
  const { t } = useTranslation()

  const { vendorId, userId, projectId, memoryId, taskId, offerId, institutionPartnerId }: idTypes =
    match?.params || {}

  const { vendor } = useFetchVendor({ id: vendorId })
  const { offer } = useFetchOutsourceOffer(offerId)
  const { user } = useFetchUser({ id: userId })
  const { project } = useFetchProject({ id: projectId })
  const { translationMemory } = useFetchTranslationMemory({
    id: memoryId,
  })
  const { task } = useFetchTask({
    id: taskId,
  })
  const { historyTask } = useFetchHistoryTask({
    id: taskId,
  })
  const { institutionPartner } = useFetchInstitutionPartner({ id: institutionPartnerId })

  const isHistoryTask = includes(match?.pathname, '/isHistoryView')
  const isVendorTasksPage = includes(match?.pathname, '/vendor-tasks')

  const { name } = useMemo(() => {
    switch (true) {
      case !!vendorId && isVendorTasksPage: {
        return {
          name: t('my_tasks.in_progress_tasks'),
        }
      }
      case !!vendorId: {
        return {
          name: `${vendor?.institution_user?.user.forename} ${vendor?.institution_user?.user.surname}`,
        }
      }
      case !!userId: {
        return { name: `${user?.user.forename} ${user?.user.surname}` }
      }
      case !!projectId: {
        return { name: `${t('projects.project')} [${project?.ext_id}]` }
      }
      case !!memoryId: {
        return { name: translationMemory?.name }
      }
      case !!taskId: {
        return {
          name: isHistoryTask
            ? historyTask?.assignment?.ext_id
            : task?.assignment?.ext_id,
        }
      }
      case !!offerId: {
        return { name: offer?.outsource_request?.assignment?.ext_id }
      }
      case !!institutionPartnerId: {
        return { name: institutionPartner?.partner_institution?.short_name }
      }

      default: {
        return {}
      }
    }
  }, [
    vendorId,
    isVendorTasksPage,
    userId,
    projectId,
    memoryId,
    taskId,
    vendor?.institution_user?.user.forename,
    vendor?.institution_user?.user.surname,
    t,
    user?.user.forename,
    user?.user.surname,
    project?.ext_id,
    translationMemory?.name,
    isHistoryTask,
    historyTask?.assignment?.ext_id,
    task?.assignment?.ext_id,
    offerId,
    offer?.outsource_request?.assignment?.ext_id,
    institutionPartnerId,
    institutionPartner?.partner_institution?.short_name,
  ])

  return <span>{includes(name, undefined) ? '' : name}</span>
}

export default BreadcrumbsTitle
