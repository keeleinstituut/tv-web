import ApiClient from './ApiClient'

export const apiClient = new ApiClient('')

export const setAccessToken = (accessToken?: string) => {
  apiClient.setAccessToken(accessToken)
}
