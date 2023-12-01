import {
  ProjectsResponse,
  ProjectsPayloadType,
  ProjectResponse,
  NewProjectPayload,
  SubProjectsResponse,
  SubProjectResponse,
  SubProjectsPayloadType,
  CatProjectPayload,
  CatToolJobsResponse,
  SubProjectPayload,
  CatJobsPayload,
  CancelProjectPayload,
  CatProjectStatus,
  SubProjectDetail,
  ProjectDetail,
} from 'types/projects'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useFilters from 'hooks/useFilters'
import { includes, map } from 'lodash'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { downloadFile } from 'helpers'
import { useCallback, useEffect, useState } from 'react'

export const useFetchProjects = (initialFilters?: ProjectsPayloadType) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<ProjectsPayloadType>(initialFilters)

  const { isLoading, isError, data } = useQuery<ProjectsResponse>({
    queryKey: ['projects', filters],
    queryFn: () => apiClient.get(`${endpoints.PROJECTS}`, filters),
    keepPreviousData: true,
  })

  const { meta: paginationData, data: projects } = data || {}

  return {
    isLoading,
    isError,
    projects,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useFetchProject = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<ProjectResponse>({
    enabled: !!id,
    queryKey: ['projects', id],
    queryFn: () => apiClient.get(`${endpoints.PROJECTS}/${id}`),
  })

  const { data: project } = data || {}

  return {
    isLoading,
    isError,
    project,
  }
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  const formData = new FormData()
  const { mutateAsync: createProject, isLoading } = useMutation({
    mutationKey: ['projects'],
    mutationFn: (payload: NewProjectPayload) => {
      for (const key in payload) {
        const typedKey = key as keyof NewProjectPayload
        const value = payload[typedKey]
        if (
          includes(
            [
              'destination_language_classifier_value_ids',
              'help_files',
              'help_file_types',
              'source_files',
            ],
            typedKey
          )
        ) {
          const typedValue = (value as string[] | File[]) || []
          for (const key in typedValue) {
            formData.append(`${typedKey}[]`, typedValue[key])
          }
        } else {
          const typedValue = (value as string) || ''
          formData.append(typedKey, typedValue)
        }
      }
      return apiClient.post(endpoints.PROJECTS, formData)
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['projects'], (oldData?: ProjectsResponse) => {
        const { data: previousData, meta } = oldData || {}
        if (!previousData || !meta) return oldData
        const newData = [...previousData, data]
        return { data: newData, meta }
      })
    },
  })

  return {
    createProject,
    isLoading,
  }
}

export const useUpdateProject = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateProject, isLoading } = useMutation({
    mutationKey: ['projects', id],
    mutationFn: (payload: Partial<NewProjectPayload>) =>
      apiClient.put(`${endpoints.PROJECTS}/${id}`, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['projects', id],
        (oldData?: ProjectsResponse) => {
          const { data: previousData } = oldData || {}

          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
      map(data.sub_projects, (subProject) =>
        queryClient.refetchQueries({ queryKey: ['subprojects', subProject.id] })
      )
    },
  })

  return {
    updateProject,
    isLoading,
  }
}

export const useUpdateSubProject = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateSubProject, isLoading } = useMutation({
    mutationKey: ['subprojects', id],
    mutationFn: (payload: SubProjectPayload) =>
      apiClient.put(`${endpoints.SUB_PROJECTS}/${id}`, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['subprojects', id],
        (oldData?: SubProjectResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
    },
  })

  return {
    updateSubProject,
    isLoading,
  }
}

export const useFetchSubProject = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<SubProjectResponse>({
    enabled: !!id,
    queryKey: ['subprojects', id],
    queryFn: () => apiClient.get(`${endpoints.SUB_PROJECTS}/${id}`),
  })

  const { data: subProject } = data || {}

  return {
    isLoading,
    isError,
    subProject,
  }
}

export const useFetchSubProjects = () => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<SubProjectsPayloadType>()

  const { isLoading, isError, data } = useQuery<SubProjectsResponse>({
    queryKey: ['subprojects', filters],
    queryFn: () => apiClient.get(`${endpoints.SUB_PROJECTS}`, filters),
    keepPreviousData: true,
  })

  const { meta: paginationData, data: subProjects } = data || {}

  return {
    isLoading,
    isError,
    subProjects,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useSubProjectSendToCat = () => {
  const { mutateAsync: sendToCat, isLoading } = useMutation({
    mutationKey: ['send_cat'],
    mutationFn: (payload: CatProjectPayload) =>
      apiClient.post(endpoints.CAT_TOOL_SETUP, payload),
  })
  return {
    sendToCat,
    isCatProjectLoading: isLoading,
  }
}

export const useFetchSubProjectCatToolJobs = ({ id }: { id?: string }) => {
  const [shouldRefetch, setShouldRefetch] = useState(false)
  const { data } = useQuery<CatToolJobsResponse>({
    enabled: !!id,
    queryKey: ['cat-jobs', id],
    queryFn: () => apiClient.get(`${endpoints.CAT_TOOL_JOBS}/${id}`),
    ...(shouldRefetch ? { refetchInterval: 3000 } : {}),
  })
  useEffect(() => {
    if (
      includes(
        [CatProjectStatus.Done, CatProjectStatus.Failed],
        data?.data?.setup_status
      )
    ) {
      setShouldRefetch(false)
    }
  }, [data?.data?.setup_status, shouldRefetch])

  const startPolling = useCallback(() => {
    setShouldRefetch(true)
  }, [])
  return {
    catToolJobs: data?.data?.cat_jobs,
    catSetupStatus: data?.data?.setup_status,
    catAnalyzeStatus: data?.data?.analyzing_status,
    startPolling,
  }
}

export const useSplitCatJobs = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: splitCatJobs, isLoading } = useMutation({
    mutationKey: ['cat-jobs'],
    mutationFn: (payload: CatJobsPayload) =>
      apiClient.post(endpoints.CAT_TOOL_SPLIT, payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['cat-jobs'], type: 'active' })
    },
  })

  return {
    splitCatJobs,
    isLoading,
  }
}
export const useMergeCatJobs = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: mergeCatJobs, isLoading } = useMutation({
    mutationKey: ['cat-jobs'],
    mutationFn: (payload: CatJobsPayload) =>
      apiClient.post(endpoints.CAT_TOOL_MERGE, payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['cat-jobs'], type: 'active' })
    },
  })

  return {
    mergeCatJobs,
    isLoading,
  }
}

export const useDownloadXliffFile = () => {
  const { mutateAsync: downloadXliff, isLoading } = useMutation({
    mutationKey: ['xliff'],
    mutationFn: (sub_project_id: string) =>
      apiClient.get(
        `${endpoints.DOWNLOAD_XLIFF}/${sub_project_id}`,
        {},
        { responseType: 'blob' }
      ),
    onSuccess: (data) => {
      downloadFile({
        data,
        fileName: 'xliff.zip',
      })
    },
  })
  return {
    isLoading,
    downloadXliff,
  }
}
export const useDownloadTranslatedFile = () => {
  const { mutateAsync: downloadTranslatedFile, isLoading } = useMutation({
    mutationKey: ['translated'],
    mutationFn: (sub_project_id: string) =>
      apiClient.get(
        `${endpoints.DOWNLOAD_TRANSLATED}/${sub_project_id}`,
        {},
        { responseType: 'blob' }
      ),
    onSuccess: (data) => {
      downloadFile({
        data,
        fileName: 'translatedFile.zip',
      })
    },
  })
  return {
    isLoading,
    downloadTranslatedFile,
  }
}

// TODO: no idea what the endpoint will be
export const useSubProjectWorkflow = ({
  id,
  projectId,
}: {
  id?: string
  projectId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: startSubProjectWorkflow, isLoading } = useMutation({
    mutationKey: ['project_workflow', id],
    mutationFn: () =>
      apiClient.post(`${endpoints.SUB_PROJECTS}/${id}/start-workflow`),
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ['subprojects', id] })
      queryClient.refetchQueries({ queryKey: ['projects', projectId] })
    },
  })

  return {
    startSubProjectWorkflow,
    isLoading,
  }
}

export const useToggleMtEngine = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: toggleMtEngine, isLoading } = useMutation({
    mutationKey: ['mt_engine', id],
    mutationFn: async (payload: { mt_enabled: boolean }) =>
      apiClient.put(`${endpoints.MT_ENGINE}/${id}`, payload),
    onSuccess: ({ data }: { data: { mt_enabled: boolean } }) => {
      queryClient.setQueryData(
        ['subprojects', id],
        (oldData?: SubProjectResponse) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          return {
            data: {
              ...previousData,
              mt_enabled: data?.mt_enabled,
            },
          }
        }
      )
    },
  })

  return {
    toggleMtEngine,
    isLoading,
  }
}

export const useCancelProject = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: cancelProject, isLoading } = useMutation({
    mutationKey: ['projects', id],
    mutationFn: async (payload: CancelProjectPayload) =>
      apiClient.post(`${endpoints.PROJECTS}/${id}/cancel`, payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['projects', id] })
    },
  })

  return {
    cancelProject,
    isLoading,
  }
}

export const useSubProjectCache = (
  id?: string
): SubProjectDetail | undefined => {
  const queryClient = useQueryClient()
  const subProjectCache: { data: SubProjectDetail } | undefined =
    queryClient.getQueryData(['subprojects', id])
  const subProject = subProjectCache?.data

  return subProject
}

export const useProjectCache = (id?: string): ProjectDetail | undefined => {
  const queryClient = useQueryClient()
  const projectCache: { data: ProjectDetail } | undefined =
    queryClient.getQueryData(['projects', id])
  const project = projectCache?.data

  return project
}
