import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, setCsrfToken } from 'api'
import { authEndpoints, endpoints } from 'api/endpoints'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { InstitutionSelectModalProps } from 'components/organisms/modals/InstitutionSelectModal/InstitutionSelectModal'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import useAsRef from 'hooks/useAsRef'
import i18n from 'i18n/i18n'
import { isEmpty, size, includes } from 'lodash'
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { InstitutionDataType } from 'types/institutions'
import { PrivilegeKey } from 'types/privileges'
import {
  getNotificationThreshold,
  shouldLogoutAfterExpiryCheck,
} from './authSession'

interface UserInfoType {
  tolkevarav?: {
    selectedInstitution?: {
      id: string
      name: string
      type?: 'INSTITUTION' | 'TRANSLATION_AGENCY' | null
    }
    surname?: string
    forename?: string
    privileges?: PrivilegeKey[]
    institutionUserId?: string
  }
}

interface AuthContextType {
  initializing: boolean
  isUserLoggedIn: boolean
  login: () => void
  logout: () => void
  userInfo: UserInfoType
  userPrivileges: PrivilegeKey[]
  institutionUserId: string
  selectedInstitutionType?: 'INSTITUTION' | 'TRANSLATION_AGENCY' | null
  selectedInstitutionId?: string
  isTranslationAgency: boolean
  institutions: InstitutionDataType[]
  openInstitutionSelectModal: (
    props: Partial<InstitutionSelectModalProps>
  ) => void
}

const authContextDefaultValues: AuthContextType = {
  initializing: true,
  isUserLoggedIn: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: () => {},
  userInfo: {},
  userPrivileges: [],
  institutionUserId: '',
  selectedInstitutionType: undefined,
  selectedInstitutionId: undefined,
  isTranslationAgency: false,
  institutions: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openInstitutionSelectModal: () => {},
}

const authContext = createContext<AuthContextType>(authContextDefaultValues)

export const useAuth = () => {
  return useContext(authContext)
}

export const rawLogin = () => {
  window.location.href = `${authEndpoints.LOGIN}?redirect_uri=${window.location.href}`
}

export const rawLogout = (error?: string) => {
  let redirectUri = window.location.origin

  if (error) {
    redirectUri += `#${error}`
  }
  window.location.href = `${
    authEndpoints.LOGOUT
  }?redirect_uri=${encodeURIComponent(redirectUri)}`
}

export const AuthProvider: FC<PropsWithChildren> = (props) => {
  const { children } = props

  const queryClient = useQueryClient()
  const isVerifyingSessionRef = useRef(false)

  const login = useCallback(() => {
    rawLogin()
  }, [])

  const logout = useCallback(
    (error?: string) => {
      queryClient.clear()
      rawLogout(error)
    },
    [queryClient]
  )

  const contextQuery = useQuery(
    ['auth-context'],
    () => {
      return apiClient.get(authEndpoints.CONTEXT)
    },
    {
      onSuccess(data) {
        setCsrfToken(data.csrfToken)
      },
      refetchInterval: 60000, // Refetch every 60 seconds
    }
  )

  const context = contextQuery.data
  const isUserLoggedIn = context?.authenticated || false
  const user = context?.user
  const isInstitutionSelected = !!user?.selectedInstitution

  const { data, isLoading } = useQuery({
    enabled: isUserLoggedIn,
    queryKey: ['institutions'],
    queryFn: () => {
      // retry limit is 2, here we start the request and retry counter 2, so it wouldn't retry this request
      return apiClient.get(endpoints.INSTITUTIONS, {}, { retries: 2 })
    },
  })

  const institutions = data?.data

  const switchInstitutionMutation = useMutation({
    mutationKey: ['auth-context', 'selected-institution'],
    mutationFn: (institutionId: string) => {
      return apiClient.get(
        `${authEndpoints.SWITCH_CONTEXT}?institution_id=${institutionId}`
      )
    },
    onSuccess: (data) => {
      contextQuery.refetch()
    },
  })
  const switchInstitutionMutationRef = useAsRef(switchInstitutionMutation)

  const openInstitutionSelectModal = useCallback(
    (props: Partial<InstitutionSelectModalProps> = {}) => {
      showModal(ModalTypes.InstitutionSelect, {
        ...props,
        institutions,
        onSelect: async (id: string) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          await switchInstitutionMutationRef.current!.mutateAsync(id)

          if (props.onSelect) {
            props.onSelect(id)
          }
        },
      })
    },
    [institutions, switchInstitutionMutationRef]
  )

  useEffect(() => {
    // Currently will show error with any hash
    // If we add any extra hash parameters later, then this should be changed
    if (window.location.hash && includes(window.location.hash, 'show-error')) {
      showNotification({
        type: NotificationTypes.Error,
        title: i18n.t('notification.error'),
        content: i18n.t('error.token_expired_error'),
      })
    }
  }, [])

  useEffect(() => {
    const institutionsCount = size(institutions)

    if (isInstitutionSelected) {
      // Do nothing
    } else if (isUserLoggedIn && institutionsCount === 0 && !isLoading) {
      logout('show-error')
    } else if (institutionsCount === 1) {
      const selectedInstitutionId = institutions[0].id
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      switchInstitutionMutationRef.current!.mutate(selectedInstitutionId)
    } else if (institutionsCount > 1) {
      openInstitutionSelectModal({
        onClose: logout,
      })
    }
  }, [
    isUserLoggedIn,
    institutions,
    openInstitutionSelectModal,
    switchInstitutionMutationRef,
    isInstitutionSelected,
    logout,
    isLoading,
  ])

  const userInfo = useMemo(() => {
    return {
      tolkevarav: user,
    }
  }, [user])
  const userPrivileges = useMemo(() => user?.privileges || [], [user])
  const institutionUserId = user?.institutionUserId || ''
  const selectedInstitutionType = user?.selectedInstitution?.type
  const selectedInstitutionId = user?.selectedInstitution?.id
  const initializing = contextQuery.isLoading

  const checkSession = useCallback(async () => {
    if (document.hidden) {
      return
    }

    const now = Math.ceil(Date.now() / 1000)
    const sessionExpires = context?.sessionExpiry

    if (!sessionExpires || !context?.authenticated) {
      return
    }

    const remaining = sessionExpires - now
    const isSessionExpired = now >= sessionExpires
    const currentNotificationThreshold = getNotificationThreshold(remaining)

    if (
      currentNotificationThreshold &&
      remaining <= currentNotificationThreshold
    ) {
      let time_left = currentNotificationThreshold
      let time_unit = i18n.t('error.time_unit_s')
      const time_left_m = time_left / 60

      // If remainder is bigger than 60s then display it in minutes
      if (time_left_m >= 1) {
        time_left = Math.floor(time_left_m)
        time_unit = i18n.t('error.time_unit_m')
      }

      showNotification({
        type: NotificationTypes.Warning,
        title: i18n.t('notification.error'),
        content: i18n.t('error.token_will_expire_soon', {
          time_left,
          time_unit,
        }),
      })
    }

    if (!isSessionExpired || isVerifyingSessionRef.current) {
      return
    }

    isVerifyingSessionRef.current = true

    try {
      const result = await contextQuery.refetch()
      const freshNow = Math.ceil(Date.now() / 1000)

      if (shouldLogoutAfterExpiryCheck(freshNow, result.data)) {
        logout()
      }
    } finally {
      isVerifyingSessionRef.current = false
    }
  }, [logout, context, contextQuery])

  const checkSessionRef = useAsRef(checkSession)

  // Session update timer
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const timer = setInterval(() => checkSessionRef.current!(), 1000)
    return () => clearInterval(timer)
  }, [checkSessionRef])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        contextQuery.refetch()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [contextQuery])

  const value = useMemo((): AuthContextType => {
    return {
      isUserLoggedIn: isUserLoggedIn && !isEmpty(institutions),
      login,
      logout,
      userInfo,
      userPrivileges,
      institutionUserId,
      selectedInstitutionType,
      selectedInstitutionId,
      isTranslationAgency: selectedInstitutionType === 'TRANSLATION_AGENCY',
      initializing,
      institutions,
      openInstitutionSelectModal,
    }
  }, [
    isUserLoggedIn,
    login,
    logout,
    userInfo,
    userPrivileges,
    institutionUserId,
    selectedInstitutionType,
    selectedInstitutionId,
    initializing,
    institutions,
    openInstitutionSelectModal,
  ])

  return <authContext.Provider value={value}>{children}</authContext.Provider>
}
