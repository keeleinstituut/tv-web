import { FC, SVGProps } from 'react'
import { IconProps } from 'components/molecules/Button/Button'
import { ReactComponent as Info } from 'assets/icons/info.svg'
import classNames from 'classnames'

import classes from './styles.module.scss'

export interface SmallTooltipProps {
  tooltipContent?: string
  icon?: FC<SVGProps<SVGSVGElement>>
  ariaLabel?: string
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
}) => {
  return (
    <div className={classes.tooltipWrapper}>
      <span className={classes.tooltipContent}>{tooltipContent}</span>
      <Icon className={classes.iconButton} icon={icon} ariaLabel={ariaLabel} />
    </div>
  )
}

export default SmallTooltip
