import { ReactNode, forwardRef } from 'react'
import { Field, Label } from '@radix-ui/react-form'
import classNames from 'classnames'
import { FieldError } from 'react-hook-form'
import { omit } from 'lodash'
import InputError from 'components/atoms/InputError/InputError'

import classes from './styles.module.scss'

export type InputWrapperProps = {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  children?: ReactNode
  onClick?: () => void
  wrapperClass?: string
  errorClass?: string
  errorZIndex?: number
}

const InputWrapper = forwardRef<HTMLInputElement, InputWrapperProps>(
  function InputWrapper(
    {
      label,
      name,
      error,
      className,
      children,
      onClick,
      wrapperClass,
      errorClass,
      errorZIndex,
    },
    ref
  ) {
    return (
      <Field name={name} className={classNames(classes.container, className)}>
        <Label
          htmlFor={name}
          className={classNames(classes.label, !label && classes.hiddenLabel)}
        >
          {label}
        </Label>
        <div
          className={classNames(classes.wrapper, wrapperClass)}
          ref={ref}
          onClick={onClick}
        >
          {children}
          <InputError
            {...omit(error, 'ref')}
            className={errorClass}
            errorZIndex={errorZIndex}
          />
        </div>
      </Field>
    )
  }
)

export default InputWrapper
