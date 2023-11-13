import { ReactNode, RefObject, forwardRef, useRef } from 'react'
import { Field, Label } from '@radix-ui/react-form'
import classNames from 'classnames'
import { FieldError } from 'react-hook-form'
import { omit } from 'lodash'
import InputError from 'components/atoms/InputError/InputError'

import classes from './classes.module.scss'

export type InputWrapperProps = {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  children?: ReactNode
  wrapperClass?: string
  errorClass?: string
  errorZIndex?: number
  paginationLabelClassName?: string
}

const InputWrapper = forwardRef<HTMLInputElement, InputWrapperProps>(
  function InputWrapper(
    {
      label,
      name,
      error,
      className,
      children,
      wrapperClass,
      errorClass,
      errorZIndex,
      paginationLabelClassName,
    },
    ref
  ) {
    const wrapperRef = useRef(null)
    return (
      <Field
        name={name}
        className={classNames(
          className,
          paginationLabelClassName
            ? paginationLabelClassName
            : classes.container
        )}
        ref={wrapperRef}
      >
        <Label
          htmlFor={name}
          className={classNames(classes.label, !label && classes.hiddenLabel)}
        >
          {label}
        </Label>
        <div className={classNames(classes.wrapper, wrapperClass)} ref={ref}>
          {children}
          <InputError
            {...omit(error, 'ref')}
            wrapperRef={ref as RefObject<HTMLElement>}
            className={errorClass}
            errorZIndex={errorZIndex}
          />
        </div>
      </Field>
    )
  }
)

export default InputWrapper
