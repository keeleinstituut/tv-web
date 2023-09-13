import { RefObject, forwardRef, useRef } from 'react'
import classNames from 'classnames'
import { Field, Label, Control } from '@radix-ui/react-form'
import classes from './classes.module.scss'
import { omit } from 'lodash'
import { InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import InputError from 'components/atoms/InputError/InputError'

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
      errorZIndex,
      onClick,
      onChange,
      error,
      ...rest
    },
    ref
  ) {
    const wrapperRef = useRef(null)
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
          ref={wrapperRef}
        >
          <div className={classes.visibleCheckbox} />
        </div>
        <Label
          className={classNames(classes.label, !label && classes.hiddenLabel)}
        >
          {label}
        </Label>
        <InputError
          {...omit(error, 'ref')}
          errorZIndex={errorZIndex}
          wrapperRef={wrapperRef as RefObject<HTMLElement>}
        />
      </Field>
    )
  }
)

export default CheckBoxInput
