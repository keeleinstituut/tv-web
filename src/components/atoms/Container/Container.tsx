import { FC, PropsWithChildren } from 'react'
import classNames from 'classnames'
import classes from './styles.module.scss'

interface ContainerProps {
  className?: string
}

const Container: FC<PropsWithChildren<ContainerProps>> = ({
  children,
  className,
}) => {
  return (
    <section className={classNames(classes.container, className)}>
      {children}
    </section>
  )
}

export default Container
