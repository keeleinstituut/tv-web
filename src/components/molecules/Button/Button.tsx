import { FC, PropsWithChildren, SVGProps, FunctionComponent } from 'react'
import BaseButton, {
  BaseButtonProps,
} from 'components/atoms/BaseButton/BaseButton'
import classNames from 'classnames'
import classes from './styles.module.scss'

export enum AppearanceTypes {
  Primary = 'primary',
  Secondary = 'secondary',
  Text = 'text',
}

export enum SizeTypes {
  M = 'm',
  S = 's',
}

export interface ButtonProps extends BaseButtonProps {
  appearance?: AppearanceTypes
  size?: SizeTypes
  icon?: FunctionComponent<SVGProps<SVGSVGElement>>
  ariaLabel?: string
  hidden?: boolean
  disabled?: boolean
  className?: string
}

export type IconProps = {
  icon?: FunctionComponent<SVGProps<SVGSVGElement>>
  className?: string
  ariaLabel?: string
}

const Icon: FC<IconProps> = ({ icon: IconComponent, className, ariaLabel }) => {
  const ariaLabelToUse = ariaLabel

  if (!IconComponent) return null
  return (
    <IconComponent
      className={(classes.icon, className)}
      aria-label={ariaLabelToUse}
    />
  )
}

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  appearance = 'primary',
  size = 'm',
  icon,
  ariaLabel,
  hidden,
  disabled,
  className,
  children,
  ...rest
}) => {
  if (hidden) return null
  return (
    <BaseButton
      className={classNames(
        classes.btn,
        classes[`${appearance}`],
        classes[`${size}`],
        classes.baseButton,
        className
      )}
      disabled={disabled}
      {...rest}
    >
      <span className={classes.buttonText}>{children}</span>
      <Icon icon={icon} className={className} ariaLabel={ariaLabel} />
    </BaseButton>
  )
}

export default Button
