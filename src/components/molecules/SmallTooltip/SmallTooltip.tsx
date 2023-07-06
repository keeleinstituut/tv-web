import { FC, RefObject, SVGProps, useMemo, useRef } from 'react'
import { IconProps } from 'components/molecules/Button/Button'
import { ReactComponent as Info } from 'assets/icons/info.svg'
import { useInViewport } from 'ahooks'
import classNames from 'classnames'

import classes from './classes.module.scss'

interface SmallTooltipProps {
  tooltipContent?: string
  icon?: FC<SVGProps<SVGSVGElement>>
  ariaLabel?: string
  hidden?: boolean
  containerRef?: RefObject<HTMLDivElement>
  className?: string
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

const SmallTooltip: FC<SmallTooltipProps> = ({
  tooltipContent,
  icon,
  ariaLabel,
  hidden,
  containerRef,
  className,
}) => {
  const contentRef = useRef(null)
  const [inViewport, ratio] = useInViewport(contentRef, { root: containerRef })
  const useBottomPosition = useMemo(
    () => ratio && ratio < 1 && inViewport,
    // inViewport changes, when we hover the element and it becomes visible
    // We don't want to update this state during any other time
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inViewport]
  )
  if (hidden) return null
  return (
    <div className={classNames(classes.tooltipWrapper, className)}>
      <p
        ref={contentRef}
        className={classNames(
          classes.tooltipContent,
          useBottomPosition && classes.bottomPosition
        )}
      >
        {tooltipContent}
      </p>
      <Icon icon={icon} ariaLabel={ariaLabel} />
    </div>
  )
}

export default SmallTooltip
