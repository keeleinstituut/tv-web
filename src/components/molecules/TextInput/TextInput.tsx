import { forwardRef } from 'react'
import classNames from 'classnames'
import { Field, Label, Control } from '@radix-ui/react-form'
import styles from './styles.module.scss'

import { InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'label'> {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(props, ref) {
    const { label, ariaLabel, name, className, value, placeholder, ...rest } =
      props

    // Might need event handler wrappers here
    // Essentially this is just ariaLabel || label, but typescript seems to fail here
    const ariaLabelToUse = ariaLabel || (label as string)
    return (
      <Field name={name} className={classNames(styles.container, className)}>
        <Label className={classNames(styles.label, !label && styles.hidden)}>
          {label}
        </Label>
        <Control asChild>
          <input
            {...(placeholder ? { placeholder } : {})}
            ref={ref}
            value={value || ''}
            aria-label={ariaLabelToUse}
            {...rest}
          />
        </Control>
      </Field>
    )
  }
)

export default TextInput
