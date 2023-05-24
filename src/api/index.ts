import ApiClient from './ApiClient'

export const apiClient = new ApiClient('')
export const authApiClient = new ApiClient(
  process.env.REACT_APP_KEYCLOAK_url || ''
)

export const setAccessToken = (accessToken?: string) => {
  apiClient.setAccessToken(accessToken)
  authApiClient.setAccessToken(accessToken)
}
