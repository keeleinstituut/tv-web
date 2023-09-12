import { RefObject, forwardRef } from 'react'
import classNames from 'classnames'
import classes from './classes.module.scss'
import { omit } from 'lodash'
import { InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import InputError from 'components/atoms/InputError/InputError'

// TODO: css and html are nearly identical for RadioInput and CheckBoxInput
// Currently copy-pasted it, but we should unify them

export interface RadioInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'label' | 'placeholder' | 'value'
  > {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
  value?: string
  errorZIndex?: number
  optionValue: string
}

const RadioInput = forwardRef<HTMLInputElement, RadioInputProps>(
  function RadioInput(
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
      optionValue,
      ...rest
    },
    ref
  ) {
    return (
      <div
        className={classNames(
          classes.container,
          disabled && classes.disabled,
          className
        )}
      >
        <input
          ref={ref}
          value={optionValue}
          name={name}
          type="radio"
          checked={value === optionValue}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={onClick}
          onChange={onClick ? undefined : onChange}
          id={optionValue}
          {...rest}
        />
        <div
          className={classNames(
            classes.checkBoxContainer,
            value === optionValue && classes.checked
          )}
        >
          <div className={classes.visibleCheckbox} />
        </div>
        <label htmlFor={optionValue} className={classNames(classes.label)}>
          {label}
        </label>
        <InputError
          {...omit(error, 'ref')}
          errorZIndex={errorZIndex}
          wrapperRef={ref as RefObject<HTMLElement>}
        />
      </div>
    )
  }
)

export default RadioInput
