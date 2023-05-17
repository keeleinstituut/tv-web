import { FC, SVGProps } from 'react'

export type IconProps = {
  icon?: FC<SVGProps<SVGSVGElement>>
  className?: string
}

const Icon: FC<IconProps> = ({ icon: IconComponent, className }) => {
  if (!IconComponent) return null
  return <IconComponent className={className} />
}

export default Icon
