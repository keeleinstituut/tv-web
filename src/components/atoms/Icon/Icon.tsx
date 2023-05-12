import { FC, SVGProps } from 'react'

export type IconProps = {
  icon?: FC<SVGProps<SVGSVGElement>>
  className?: string
  ariaLabel?: string
}

const Icon: FC<IconProps> = ({ icon: IconComponent, className, ariaLabel }) => {
  if (!IconComponent) return null
  return <IconComponent className={className} aria-label={ariaLabel} />
}

export default Icon
