import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "api"
import { CAT2_API_BASE_URL } from "./constants"

export const useCatProject = (catProjectId?: string) =>
  useQuery({
    queryFn: () => apiClient.get(`${CAT2_API_BASE_URL}/projects/${catProjectId}`),
    queryKey: ['catProject', catProjectId],
    enabled: !!catProjectId,
  })

export const useCatTranslationMemoriesList = () =>
  useQuery({
    queryFn: () => apiClient.get(`${CAT2_API_BASE_URL}/translation-memories`, { with_segment_count: '1' }),
    queryKey: ['catTranslationMemories', { with_segment_count: true }],
  })

export const useUpdateCatProjectTranslationMemories = (catProjectId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (translation_memories: { id: string; read: boolean; write: boolean }[]) =>
      apiClient.put(`${CAT2_API_BASE_URL}/projects/${catProjectId}`, { translation_memories }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catProject', catProjectId] }),
  })
}
