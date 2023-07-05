import { forwardRef } from 'react'
import classNames from 'classnames'
import { Field, Label, Control } from '@radix-ui/react-form'
import classes from './classes.module.scss'
import { InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'

export interface CheckBoxInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'label' | 'placeholder' | 'value'
  > {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
  value?: boolean
  errorZIndex?: number
}

const CheckBoxInput = forwardRef<HTMLInputElement, CheckBoxInputProps>(
  function CheckBoxInput(
    {
      label,
      name,
      ariaLabel,
      className,
      disabled,
      value = false,
      onClick,
      onChange,
      ...rest
    },
    ref
  ) {
    return (
      <Field
        name={name}
        className={classNames(
          classes.container,
          disabled && classes.disabled,
          className
        )}
      >
        <Control asChild>
          <input
            ref={ref}
            type="checkbox"
            checked={value}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={onClick}
            onChange={onClick ? undefined : onChange}
            {...rest}
          />
        </Control>
        <div
          className={classNames(
            classes.checkBoxContainer,
            value && classes.checked
          )}
        >
          <div className={classes.visibleCheckbox} />
        </div>
        <Label className={classNames(classes.label)}>{label}</Label>
      </Field>
    )
  }
)

export default CheckBoxInput
