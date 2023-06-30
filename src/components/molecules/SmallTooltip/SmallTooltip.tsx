import { FC, SVGProps, useState } from 'react'
import { IconProps } from 'components/molecules/Button/Button'
import BaseButton from 'components/atoms/BaseButton/BaseButton'

import classes from './styles.module.scss'

export interface SmallTooltipProps {
  tooltipContent?: string
  icon?: FC<SVGProps<SVGSVGElement>>
  ariaLabel?: string
}

const Icon: FC<IconProps> = ({ icon: IconComponent, ariaLabel }) => {
  if (!IconComponent) return null
  return <IconComponent aria-label={ariaLabel} />
}

const SmallTooltip: FC<SmallTooltipProps> = ({
  tooltipContent,
  icon,
  ariaLabel,
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)

  const handleTooltipOpen = () => {
    setIsTooltipVisible(!isTooltipVisible)
  }
  return (
    <div className={classes.tooltipWrapper}>
      <div hidden={!isTooltipVisible} className={classes.tooltipContent}>
        {tooltipContent}
      </div>

      <BaseButton className={classes.iconButton} onClick={handleTooltipOpen}>
        <Icon icon={icon} ariaLabel={ariaLabel} />
      </BaseButton>
    </div>
  )
}

export default SmallTooltip
