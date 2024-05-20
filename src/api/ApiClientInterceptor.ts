import { apiClient } from 'api'
import { AxiosRequestConfigWithRetries } from './ApiClient'

interface ResponseInterface {
  status: number
}

interface ErrorInterface {
  response?: ResponseInterface
  code: string
  config: AxiosRequestConfigWithRetries
}

const shouldRetry = (error: ErrorInterface): boolean => {
  const { response } = error
  if (!response) return false
  return (
    [429, 500, 502, 503, 504, 401].includes(response.status) ||
    error.code === 'ECONNABORTED'
  )
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

const interceptor = async (error: ErrorInterface) => {
  const config = error.config
  const retryLimit = 2

  config.retries = config.retries || 0

  if (shouldRetry(error) && config.retries < retryLimit) {
    config.retries += 1

    await delay(1000 * config.retries)
    return apiClient.request(config)
  }

  return Promise.reject(error)
}

export default interceptor
