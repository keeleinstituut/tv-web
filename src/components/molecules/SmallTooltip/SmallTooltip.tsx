import { FC, RefObject, SVGProps, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconProps } from 'components/molecules/Button/Button'
import { ReactComponent as Info } from 'assets/icons/info.svg'
import useElementPosition from 'hooks/useElementPosition'
import { useInViewport } from 'ahooks'
import classNames from 'classnames'

import classes from './classes.module.scss'
import useTableContext from 'hooks/useTableContext'
import useModalContext from 'hooks/useModalContext'

interface TooltipContentProps {
  tooltipContent?: string
  wrapperRef?: RefObject<HTMLDivElement>
  isVisible?: boolean
  horizontalScrollContainerId?: string
  className?: string
}

const TooltipContent: FC<TooltipContentProps> = ({
  tooltipContent,
  isVisible,
  wrapperRef,
  className,
}) => {
  const { horizontalWrapperId, tableRef } = useTableContext()
  const { modalContentId } = useModalContext()
  const contentRef = useRef(null)
  const { left = 0, top = 0 } =
    useElementPosition({ ref: wrapperRef, forceRecalculate: isVisible }) || {}

  const [inViewport, ratio = 0] = useInViewport(contentRef, {
    root: tableRef as RefObject<HTMLDivElement> | undefined,
  })
  const useBottomPosition = useMemo(
    () => (ratio || ratio === 0) && ratio < 1 && inViewport && !modalContentId,
    //   // inViewport changes, when we hover the element and it becomes visible
    //   // We don't want to update this state during any other time
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inViewport]
  )

  if (horizontalWrapperId) {
    return createPortal(
      <p
        ref={contentRef}
        className={classNames(
          classes.tooltipContent,
          useBottomPosition && classes.bottomPosition,
          isVisible && classes.visible,
          className
        )}
        style={{
          left: left - 26,
          top: top - 8,
          bottom: 'unset',
          transform: 'translateY(-100%)',
        }}
      >
        {tooltipContent}
      </p>,
      document.getElementById(modalContentId || 'root') || document.body
    )
  }
  return (
    <p
      ref={contentRef}
      className={classNames(
        classes.tooltipContent,
        useBottomPosition && classes.bottomPosition,
        isVisible && classes.visible,
        className
      )}
    >
      {tooltipContent}
    </p>
  )
}

const Icon: FC<IconProps> = ({
  icon: IconComponent = Info,
  ariaLabel,
  className,
  hidden,
}) => {
  if (!IconComponent || hidden) return null
  return (
    <IconComponent
      tabIndex={0}
      aria-label={ariaLabel}
      className={classNames(classes.infoIcon, className)}
    />
  )
}

interface SmallTooltipProps extends TooltipContentProps {
  icon?: FC<SVGProps<SVGSVGElement>>
  ariaLabel?: string
  hidden?: boolean
  className?: string
  contentClassName?: string
  hideIcon?: boolean
}

const SmallTooltip: FC<SmallTooltipProps> = ({
  icon,
  ariaLabel,
  hidden,
  className,
  horizontalScrollContainerId,
  hideIcon,
  contentClassName,
  ...rest
}) => {
  const { horizontalWrapperId } = useTableContext()
  const [isVisible, setVisible] = useState(false)

  const wrapperRef = useRef(null)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.type === 'click' ||
      (event.type === 'keydown' && (event.key === 'Enter' || event.key === ' '))
    ) {
      setVisible((prevVisible) => !prevVisible)
    }
  }

  if (hidden) return null
  return (
    <div
      className={classNames(classes.tooltipWrapper, className)}
      {...(horizontalWrapperId
        ? {
            onMouseEnter: () => setVisible(true),
            onMouseLeave: () => setVisible(false),
          }
        : {})}
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
    >
      <TooltipContent
        isVisible={isVisible}
        wrapperRef={wrapperRef}
        horizontalScrollContainerId={horizontalScrollContainerId}
        className={contentClassName}
        {...rest}
      />
      <Icon icon={icon} ariaLabel={ariaLabel} hidden={hideIcon} />
    </div>
  )
}

export default SmallTooltip
