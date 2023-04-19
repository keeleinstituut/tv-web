import { FC, FunctionComponent, SVGProps } from 'react'

export type IconProps = {
  icon?: FunctionComponent<SVGProps<SVGSVGElement>>
  className?: string
  ariaLabel?: string
}

const Icon: FC<IconProps> = ({ icon: IconComponent, className, ariaLabel }) => {
  const ariaLabelToUse = ariaLabel

  if (!IconComponent) return null
  return <IconComponent className={className} aria-label={ariaLabelToUse} />
}

export default Icon
