import { FC, PropsWithChildren, SVGProps } from 'react'
import BaseButton, {
  BaseButtonProps,
} from 'components/atoms/BaseButton/BaseButton'
import classNames from 'classnames'
import classes from './classes.module.scss'

export enum AppearanceTypes {
  Primary = 'primary',
  Secondary = 'secondary',
  Text = 'text',
}

export enum SizeTypes {
  M = 'm',
  S = 's',
}

export enum IconPositioningTypes {
  Left = 'left',
  Right = 'right',
}

export interface ButtonProps extends BaseButtonProps {
  appearance?: AppearanceTypes
  size?: SizeTypes
  icon?: FC<SVGProps<SVGSVGElement>>
  ariaLabel?: string
  hidden?: boolean
  className?: string
  iconPositioning?: IconPositioningTypes
  autoFocus?: boolean
}

export type IconProps = {
  icon?: FC<SVGProps<SVGSVGElement>>
  className?: string
  ariaLabel?: string
  hidden?: boolean
}

export const Icon: FC<IconProps> = ({
  icon: IconComponent,
  className,
  ariaLabel,
}) => {
  if (!IconComponent) return null
  return <IconComponent className={className} aria-label={ariaLabel} />
}

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  appearance = 'primary',
  size = 'm',
  iconPositioning = 'right',
  icon,
  ariaLabel,
  hidden,
  className,
  children,
  disabled,
  ...rest
}) => {
  if (hidden) return null

  return (
    <BaseButton
      className={classNames(
        classes.btn,
        classes[appearance],
        classes[size],
        classes[iconPositioning],
        icon && classes.customIconPadding,
        disabled && classes.disabled,
        className
      )}
      disabled={disabled}
      loaderClass={classes.loader}
      {...rest}
    >
      <span className={classes.buttonText}>{children}</span>
      <Icon icon={icon} ariaLabel={ariaLabel} />
    </BaseButton>
  )
}

export default Button
