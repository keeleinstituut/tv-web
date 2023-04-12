import { memo, FC } from 'react'
import classes from './styles.module.scss'
import classNames from 'classnames'

interface LoaderProps {
  loading?: boolean
  className?: string
}

const Loader: FC<LoaderProps> = ({ loading, className }) => {
  if (!loading) return null
  return <div className={classNames(classes.loader, className)} />
}

export default memo(Loader)
