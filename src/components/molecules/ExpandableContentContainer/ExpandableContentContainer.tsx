import { FC, PropsWithChildren, useCallback, useState } from 'react'
import { ReactComponent as DropdownArrow } from 'assets/icons/arrow_down.svg'
import classNames from 'classnames'

import classes from './classes.module.scss'
import BaseButton from 'components/atoms/BaseButton/BaseButton'

interface ExpandableContentContainerProps {
  className?: string
  hidden?: boolean
  extraComponent?: JSX.Element
  title?: string
  contentAlwaysVisible?: boolean
}

const ExpandableContentContainer: FC<
  PropsWithChildren<ExpandableContentContainerProps>
> = ({
  children,
  hidden,
  className,
  extraComponent,
  contentAlwaysVisible,
  title,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleIsExpanded = useCallback(
    () => setIsExpanded((prevIsExpanded) => !prevIsExpanded),
    []
  )

  return (
    <>
      <BaseButton
        onClick={toggleIsExpanded}
        hidden={hidden}
        className={classNames(
          classes.container,
          isExpanded && classes.expandedContainer,
          className
        )}
      >
        <h2>{title}</h2>
        {extraComponent}
        <DropdownArrow className={classes.iconButton} />
      </BaseButton>
      {isExpanded || contentAlwaysVisible ? children : null}
    </>
  )
}

export default ExpandableContentContainer
