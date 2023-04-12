import { forwardRef } from 'react'
import classNames from 'classnames'
import { Field, Label, Control } from '@radix-ui/react-form'
import styles from './styles.module.scss'

import { InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import { DefaultTFuncReturn } from 'i18next'

export type CheckBoxInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: DefaultTFuncReturn | JSX.Element
  name: string
  className?: string
  error?: FieldError
}

const CheckBoxInput = forwardRef<HTMLInputElement, CheckBoxInputProps>(
  function CheckBoxInput({ label, name, className, value, ...rest }, ref) {
    // Might need event handler wrappers here

    return (
      <Field name={name} className={classNames(styles.container, className)}>
        {/* TODO: will need actual design, once we have it */}
        <div className={styles.checkBox}>
          {/* <Image
            src="/icons/check-green.svg"
            alt="icon"
            width="24"
            height="24"
            className={classNames(styles.checked, value && styles.visible)}
          /> */}
          <Control asChild>
            <input ref={ref} type="checkbox" checked={!!value} {...rest} />
          </Control>
        </div>
        <Label className={classNames(styles.label)}>{label}</Label>
      </Field>
    )
  }
)

export default CheckBoxInput
