import { PropsWithChildren, Ref, forwardRef } from 'react'
import classNames from 'classnames'
import classes from './classes.module.scss'

interface ContainerProps {
  className?: string
}

const Container = (
  { children, className }: PropsWithChildren<ContainerProps>,
  ref: Ref<HTMLDivElement>
) => {
  return (
    <section ref={ref} className={classNames(classes.container, className)}>
      {children}
    </section>
  )
}

export default forwardRef(Container)
