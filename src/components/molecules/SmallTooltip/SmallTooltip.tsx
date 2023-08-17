import { FC, RefObject, SVGProps, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconProps } from 'components/molecules/Button/Button'
import { ReactComponent as Info } from 'assets/icons/info.svg'
import useElementPosition from 'hooks/useElementPosition'
import { useInViewport } from 'ahooks'
import classNames from 'classnames'

import classes from './classes.module.scss'

interface TooltipContentProps {
  tooltipContent?: string
  containerRef?: RefObject<HTMLDivElement>
  wrapperRef?: RefObject<HTMLDivElement>
  isVisible?: boolean
  horizontalScrollContainerId?: string
}

const TooltipContent: FC<TooltipContentProps> = ({
  containerRef,
  tooltipContent,
  isVisible,
  horizontalScrollContainerId,
  wrapperRef,
  ...rest
}) => {
  const contentRef = useRef(null)
  const { left, top } =
    useElementPosition(wrapperRef, horizontalScrollContainerId) || {}
  const [inViewport, ratio] = useInViewport(contentRef, { root: containerRef })
  const useBottomPosition = useMemo(
    () => ratio && ratio < 1 && inViewport,
    // inViewport changes, when we hover the element and it becomes visible
    // We don't want to update this state during any other time
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inViewport]
  )

  if (horizontalScrollContainerId) {
    return createPortal(
      <p
        ref={contentRef}
        className={classNames(
          classes.tooltipContent,
          useBottomPosition && classes.bottomPosition,
          isVisible && classes.visible
        )}
        style={{
          left: (left || 0) - 24,
          top: (top || 0) - 8,
          bottom: 'unset',
          transform: 'translateY(-100%)',
        }}
      >
        {tooltipContent}
      </p>,
      document.getElementById('root') || document.body
    )
  }
  return (
    <p
      ref={contentRef}
      className={classNames(
        classes.tooltipContent,
        useBottomPosition && classes.bottomPosition
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
}) => {
  if (!IconComponent) return null
  return (
    <IconComponent
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
}

const SmallTooltip: FC<SmallTooltipProps> = ({
  icon,
  ariaLabel,
  hidden,
  className,
  horizontalScrollContainerId,
  ...rest
}) => {
  const [isVisible, setVisible] = useState(false)

  const wrapperRef = useRef(null)

  if (hidden) return null
  return (
    <div
      className={classNames(classes.tooltipWrapper, className)}
      {...(horizontalScrollContainerId
        ? {
            onMouseEnter: () => setVisible(true),
            onMouseLeave: () => setVisible(false),
          }
        : {})}
      ref={wrapperRef}
    >
      <TooltipContent
        isVisible={isVisible}
        wrapperRef={wrapperRef}
        horizontalScrollContainerId={horizontalScrollContainerId}
        {...rest}
      />

      <Icon icon={icon} ariaLabel={ariaLabel} />
    </div>
  )
}

export default SmallTooltip
