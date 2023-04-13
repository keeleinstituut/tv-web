import { FC, PropsWithChildren } from 'react'
import BaseButton, {
  BaseButtonProps,
} from 'components/atoms/BaseButton/BaseButton'
import classes from './styles.module.scss'

export interface ButtonProps extends BaseButtonProps {
  appearance?: 'primary' | 'secondary' | 'text'
  size?: 'm' | 's'
  icon?: boolean
  hidden?: boolean
  disabled?: boolean
}

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  appearance = 'primary',
  size = 'm',
  icon,
  hidden,
  disabled,
  children,
  ...rest
}) => {
  const buttonClass = `${classes.btn} ${classes[`btn--${appearance}`]} ${
    classes[`btn--${size}`]
  } ${classes[`btn--${icon}`]} ${disabled ? classes['btn--disabled'] : ''}`

  if (hidden) return null
  return (
    <BaseButton className={buttonClass} disabled={disabled} {...rest}>
      {children}
    </BaseButton>
  )
}

export default Button
