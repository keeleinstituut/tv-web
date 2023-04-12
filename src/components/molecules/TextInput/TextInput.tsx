import { forwardRef, useState, useCallback } from 'react'
import classNames from 'classnames'
import { Field, Label, Control } from '@radix-ui/react-form'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import styles from './styles.module.scss'

import { DefaultTFuncReturn } from 'i18next'
import { InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label?: DefaultTFuncReturn | JSX.Element
  placeholder?: DefaultTFuncReturn
  name: string
  className?: string
  error?: FieldError
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(props, ref) {
    const { label, name, className, type, value, placeholder, ...rest } = props
    // Might need event handler wrappers here
    const [useType, setUseType] = useState(type)
    const toggleShowPassword = useCallback(() => {
      const newType = useType === 'password' ? 'text' : 'password'
      setUseType(newType)
    }, [useType])

    return (
      <Field name={name} className={classNames(styles.container, className)}>
        <div className={styles.labelAndInputContainer}>
          <Label className={classNames(styles.label)}>{label}</Label>
          <Control asChild>
            <input
              {...(placeholder ? { placeholder } : {})}
              ref={ref}
              type={useType}
              value={value || ''}
              {...rest}
            />
          </Control>
        </div>
        <BaseButton
          onClick={toggleShowPassword}
          hidden={type !== 'password'}
          className={styles.inputButton}
        >
          Show password
        </BaseButton>
      </Field>
    )
  }
)

export default TextInput
