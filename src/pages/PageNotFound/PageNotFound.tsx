import { FC } from 'react'
import { useRouteError } from 'react-router-dom'

const PageNotFound: FC = () => {
  const error = useRouteError()
  const errorText = error
    ? error instanceof Error
      ? `${error.message}\n${error.stack}`
      : JSON.stringify(error, null, 2)
    : null

  return (
    <div>
      <h1>This page is not found</h1>
      {errorText && (
        <pre style={{ fontSize: 12, color: 'red', whiteSpace: 'pre-wrap' }}>
          {errorText}
        </pre>
      )}
    </div>
  )
}

export default PageNotFound
