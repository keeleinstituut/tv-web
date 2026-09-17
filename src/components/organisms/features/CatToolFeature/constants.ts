const clean = (path: string) => path.replace(/^\//, '').replace('/$', '')

const gateway = (path: string) => {
  return (
    import.meta.env.REACT_APP_GATEWAY_BASE?.replace(/\/$/, '') +
    '/' +
    clean(path)
  )
}

export const CAT2_API_BASE_URL = gateway('/cat2/api')