import { forwardRef } from 'react'
import classNames from 'classnames'
import { Field, Label, Control } from '@radix-ui/react-form'
import classes from './styles.module.scss'

import { InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'

export interface CheckBoxInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'label' | 'placeholder'> {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
}

const CheckBoxInput = forwardRef<HTMLInputElement, CheckBoxInputProps>(
  function CheckBoxInput(
    { label, name, ariaLabel, className, value, ...rest },
    ref
  ) {
    // Might need event handler wrappers here

    const ariaLabelToUse = ariaLabel || (label as string)
    return (
      <Field name={name} className={classNames(classes.container, className)}>
        {/* TODO: will need actual design, once we have it */}
        <div className={classes.checkBox}>
          {/* <Image
            src="/icons/check-green.svg"
            alt="icon"
            width="24"
            height="24"
            className={classNames(classes.checked, value && classes.visible)}
          /> */}
          <Control asChild>
            <input
              ref={ref}
              type="checkbox"
              checked={!!value}
              aria-label={ariaLabelToUse}
              {...rest}
            />
          </Control>
        </div>
        <Label className={classNames(classes.label)}>{label}</Label>
      </Field>
    )
  }
)

export default CheckBoxInput
