import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
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
  wrapContent?: boolean
  isExpanded?: boolean
  onExpandedChange?: (isExpanded: boolean) => void
  id?: string
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
  wrapContent,
  isExpanded = false,
  onExpandedChange,
  id,
}) => {
  const [isExpandedLocal, setIsExpanded] = useState(isExpanded)

  const showAsExpanded = isExpanded && isExpandedLocal

  const toggleIsExpanded = useCallback(() => {
    setIsExpanded(!showAsExpanded)
    if (onExpandedChange) {
      onExpandedChange(!showAsExpanded)
    }
  }, [showAsExpanded, onExpandedChange])

  console.warn('showAsExpanded', showAsExpanded)

  const isContentVisible = showAsExpanded || contentAlwaysVisible

  return (
    <>
      <div
        className={classNames(
          classes.container,
          showAsExpanded && classes.expandedContainer,
          hidden && classes.displayNone,
          className
        )}
        id={id}
      >
        <BaseButton onClick={toggleIsExpanded} className={classes.firstRow}>
          <div>{leftComponent}</div>
          <div>
            {rightComponent}
            <DropdownArrow
              className={classNames(
                classes.iconButton,
                showAsExpanded && classes.expandedIconButton
              )}
            />
          </div>
        </BaseButton>
        {bottomComponent}
        {isContentVisible && wrapContent ? children : null}
      </div>
      {isContentVisible && !wrapContent ? children : null}
    </>
  )
}

export default ExpandableContentContainer
