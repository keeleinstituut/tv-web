import { FC, PropsWithChildren, useCallback, useState } from 'react'
import { ReactComponent as DropdownArrow } from 'assets/icons/arrow_down.svg'
import classNames from 'classnames'

import classes from './classes.module.scss'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { useTranslation } from 'react-i18next'

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
  initialIsExpanded?: boolean
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
  initialIsExpanded = false,
  onExpandedChange,
  id,
}) => {
  const [isExpandedLocal, setIsExpanded] = useState(initialIsExpanded)
  const { t } = useTranslation()
  const showAsExpanded = isExpanded || isExpandedLocal

  const toggleIsExpanded = useCallback(() => {
    setIsExpanded(!showAsExpanded)
    if (onExpandedChange) {
      onExpandedChange(!showAsExpanded)
    }
  }, [showAsExpanded, onExpandedChange])

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
        <div className={classes.firstRow}>
          <BaseButton className={classes.row} onClick={toggleIsExpanded}>
            {leftComponent}
          </BaseButton>
          <div>
            {rightComponent}
            <BaseButton
              className={classes.row}
              onClick={toggleIsExpanded}
              aria-label={t('button.expand')}
            >
              <DropdownArrow
                className={classNames(
                  classes.iconButton,
                  showAsExpanded && classes.expandedIconButton
                )}
              />
            </BaseButton>
          </div>
        </div>
        {bottomComponent}
        {isContentVisible && wrapContent ? children : null}
      </div>
      {isContentVisible && !wrapContent ? children : null}
    </>
  )
}

export default ExpandableContentContainer
