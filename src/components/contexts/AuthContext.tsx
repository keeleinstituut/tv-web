import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { authEndpoints, endpoints } from 'api/endpoints'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { InstitutionSelectModalProps } from 'components/organisms/modals/InstitutionSelectModal/InstitutionSelectModal'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import useAsRef from 'hooks/useAsRef'
import i18n from 'i18n/i18n'
import Cookies from 'js-cookie'
import { size } from 'lodash'
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { InstitutionDataType } from 'types/institutions'
import { PrivilegeKey } from 'types/privileges'

interface UserInfoType {
  tolkevarav?: {
    selectedInstitution?: {
      id: string
      name: string
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

  const login = useCallback(() => {
    rawLogin()
  }, [])

  const logout = useCallback(() => {
    queryClient.clear()
    rawLogout()
  }, [queryClient])

  const contextQuery = useQuery(['auth-context'], () => {
    return apiClient.get(authEndpoints.CONTEXT)
  })

  const context = contextQuery.data
  const isUserLoggedIn = context?.authenticated || false
  const user = context?.user
  const isInstitutionSelected = !!user?.selectedInstitution

  const institutionsQuery = useQuery({
    enabled: isUserLoggedIn,
    queryKey: ['institutions'],
    queryFn: () => {
      return apiClient.get(endpoints.INSTITUTIONS)
    },
  })

  const institutions = institutionsQuery.data?.data

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
    if (!isUserLoggedIn || isInstitutionSelected || !institutions) {
      return
    }

    const institutionsCount = size(institutions)

    if (institutionsCount === 0) {
      logout()
      return
    }

    if (institutionsCount === 1) {
      const selectedInstitutionId = institutions[0].id
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      switchInstitutionMutationRef.current!.mutate(selectedInstitutionId)
    } else {
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
  ])

  const userInfo = useMemo(() => {
    return {
      tolkevarav: user,
    }
  }, [user])
  const userPrivileges = useMemo(() => user?.privileges || [], [user])
  const institutionUserId = user?.institutionUserId || ''
  const initializing = contextQuery.isLoading

  const checkSession = useCallback(() => {
    const now = Math.ceil(Date.now() / 1000)
    const sessionExpires = Number(Cookies.get('session-expires'))

    if (!sessionExpires) {
      return
    }
    const remaining = sessionExpires - now
    const isSessionExpired = now >= sessionExpires

    const notificationThresholds = [3600, 1800, 60, 30].filter(
      (i) => remaining >= i
    )
    const currentNotificationThreshold = notificationThresholds[0]

    if (remaining <= currentNotificationThreshold) {
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

    if (isSessionExpired) {
      logout()
    }
  }, [logout])

  const checkSessionRef = useAsRef(checkSession)

  // Session update timer
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const timer = setInterval(() => checkSessionRef.current!(), 1000)
    return () => clearInterval(timer)
  }, [checkSessionRef])

  const value = useMemo((): AuthContextType => {
    return {
      isUserLoggedIn,
      login,
      logout,
      userInfo,
      userPrivileges,
      institutionUserId,
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
    initializing,
    institutions,
    openInstitutionSelectModal,
  ])

  return <authContext.Provider value={value}>{children}</authContext.Provider>
}
