import { FC, PropsWithChildren, useMemo } from 'react'
import BaseButton, {
  BaseButtonProps,
} from 'components/atoms/BaseButton/BaseButton'
import buttonArrowWhite from 'assets/icons/button_arrow_white.svg'
import buttonArrowLightGrey from 'assets/icons/button_arrow_light_grey.svg'
import buttonArrowDarkGrey from 'assets/icons/button_arrow_dark_grey.svg'
import buttonArrowBlue from 'assets/icons/button_arrow_blue.svg'
import classNames from 'classnames'
import classes from './styles.module.scss'

export interface ButtonProps extends BaseButtonProps {
  appearance?: 'primary' | 'secondary' | 'text'
  size?: 'm' | 's'
  icon?: boolean
  hidden?: boolean
  disabled?: boolean
}

export type IconProps = {
  appearance?: 'primary' | 'secondary' | 'text'
  icon?: boolean
  disabled?: boolean
}

const Icon: FC<IconProps> = ({ icon, appearance, disabled }) => {
  const iconClass = `${classes.icon} ${classes[`icon--${appearance}`]} `

  const iconButtonClass = useMemo(() => {
    switch (appearance) {
      case 'primary': {
        return buttonArrowWhite
      }
      case 'secondary': {
        return disabled ? buttonArrowLightGrey : buttonArrowDarkGrey
      }
      case 'text': {
        return disabled ? buttonArrowLightGrey : buttonArrowBlue
      }
      default: {
        return buttonArrowWhite
      }
    }
  }, [appearance, disabled])

  if (!icon) return null
  return <img className={iconClass} src={iconButtonClass} alt="buttonArrow" />
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
  } ${disabled ? classes['btn--disabled'] : ''}`

  if (hidden) return null
  return (
    <BaseButton
      className={classNames(buttonClass, classes.baseButton)}
      disabled={disabled}
      {...rest}
    >
      <span className={classes.buttonText}>{children}</span>
      <Icon icon={icon} appearance={appearance} disabled={disabled} />
    </BaseButton>
  )
}

export default Button
