import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { authEndpoints } from 'api/endpoints'

export interface Session {
  sessionId: string
  isCurrent: boolean
  sessionState: string | null
  lastAccess: string | null
  createdAt: string | null
  userAgent: string | null
  ipAddress: string | null
}

export interface SessionsResponse {
  sessions: Session[]
}

export const useSessions = () => {
  return useQuery<SessionsResponse>({
    queryKey: ['sessions'],
    queryFn: () => apiClient.get(authEndpoints.SESSIONS),
  })
}

export const useInvalidateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => {
      return apiClient.delete(authEndpoints.INVALIDATE_SESSION(sessionId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}
