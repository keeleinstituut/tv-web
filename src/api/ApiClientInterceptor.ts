import { get } from 'lodash'
import axios from 'axios'
import { keycloak, startRefreshingToken } from 'hooks/useKeycloak'
import { AxiosRequestConfigWithRetries } from './ApiClient'

interface ResultInterface {
  promise?: Promise<unknown>
  resolve?: (value: unknown) => void
  reject?: (value: unknown) => void
}

interface ResponseInterface {
  status: number
}

interface ErrorInterface {
  response?: ResponseInterface
  code: string
  config: object
}

const Defer = () => {
  const result: ResultInterface = {}
  result.promise = new Promise((resolve, reject) => {
    result.resolve = resolve
    result.reject = reject
  })
  return result
}

const interceptor = (error: ErrorInterface) => {
  const { response } = error

  if (
    (response &&
      (response.status === 429 ||
        response.status === 0 ||
        response.status > 500 ||
        // TODO: 403 needs to be changed to 401, once BE has made the change
        // Waiting for task: https://github.com/keeleinstituut/tv-tolkevarav/issues/393
        response.status === 403)) ||
    error.code === 'ECONNABORTED'
  ) {
    if (response && response.status === 403) {
      // Attempt token refresh, log out if it fails
      startRefreshingToken(() => {
        keycloak.clearToken()
        keycloak.logout({
          redirectUri: `${window.location.href}#show-error`,
        })
      }, true)
    }
    const deferred = Defer()
    let retries = get(error, 'config.retries', 0)
    const retryLimit = 2

    if (retries >= retryLimit) {
      if (response) {
        return Promise.reject(response)
      }
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        status: 0,
        data: '',
      })
    }

    const defaultDelay = 1000 * retries + Math.round(1000 * Math.random())
    retries += 1

    const configWithRetry: AxiosRequestConfigWithRetries = {
      ...error.config,
      retries,
    }

    setTimeout(async () => {
      try {
        const res = axios.request(configWithRetry)
        deferred?.resolve?.(res)
      } catch (err) {
        deferred?.reject?.(err)
      }
    }, defaultDelay)

    return deferred.promise
  }

  return Promise.reject(error)
}

export default interceptor
