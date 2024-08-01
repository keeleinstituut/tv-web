import ApiClient from './ApiClient'

export const apiClient = new ApiClient('')

export const setCsrfToken = (csrfToken?: string) => {
  apiClient.setCsrfToken(csrfToken)
}
