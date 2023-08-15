import { FC, PropsWithChildren, useCallback, useState } from 'react'
import { ReactComponent as DropdownArrow } from 'assets/icons/arrow_down.svg'
import classNames from 'classnames'

import classes from './classes.module.scss'
import BaseButton from 'components/atoms/BaseButton/BaseButton'

interface ExpandableContentContainerProps {
  className?: string
  hidden?: boolean
  rightComponent?: JSX.Element
  leftComponent?: JSX.Element
  bottomComponent?: JSX.Element
  title?: string
  contentAlwaysVisible?: boolean
}

const ExpandableContentContainer: FC<
  PropsWithChildren<ExpandableContentContainerProps>
> = ({
  children,
  hidden,
  className,
  rightComponent,
  leftComponent,
  bottomComponent,
  contentAlwaysVisible,
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
        <div className={classes.firstRow}>
          <div>{leftComponent}</div>
          <div>
            {rightComponent}
            <DropdownArrow className={classes.iconButton} />
          </div>
        </div>

        {bottomComponent}
      </BaseButton>
      {isExpanded || contentAlwaysVisible ? children : null}
    </>
  )
}

export default ExpandableContentContainer
