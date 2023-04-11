import { FC, Fragment, PropsWithChildren } from 'react'
import { map } from 'lodash'
import { Root } from '@radix-ui/react-form'
import DynamicInputComponent, {
  InputPropsWithoutControllerProps,
  InputTypes,
} from 'components/organisms/DynamicInputComponent/DynamicInputComponent'
import classNames from 'classnames'

import { Controller, Control, UseControllerProps } from 'react-hook-form'
import { FormEventHandler, ReactElement } from 'react'

export type InputFieldProps = UseControllerProps &
  InputPropsWithoutControllerProps

interface ComponentInForm {
  component: Array<ReactElement> | ReactElement | string
}

export type FieldProps = InputFieldProps | ComponentInForm

export interface DynamicFormProps {
  fields: FieldProps[]
  control: Control
  className?: string
  onSubmit?: FormEventHandler<HTMLFormElement>
}

const FormInput: FC<InputFieldProps> = ({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  ...rest
}) => {
  return (
    <Controller
      name={name}
      rules={rules}
      shouldUnregister={shouldUnregister}
      defaultValue={defaultValue}
      control={control}
      render={DynamicInputComponent(rest)}
    />
  )
}

const DynamicForm: FC<PropsWithChildren<DynamicFormProps>> = ({
  control,
  fields,
  className,
  onSubmit,
  children,
}) => (
  <Root className={classNames(className)} onSubmit={onSubmit}>
    {map(fields, (inputData, index) => {
      // objects inside fields array can either be props needed to render an input
      // or just components that we need to render in the middle of the form
      // Check whether we are dealing with just a component
      if ('component' in inputData) {
        // Render the component
        return <Fragment key={index}>{inputData.component}</Fragment>
      }
      // Else render Input and pass the props
      return <FormInput key={inputData.name} control={control} {...inputData} />
    })}
    {children}
  </Root>
)

// exporting InputTypes from here for convenience, since they will be used together with DynamicForm
export { InputTypes }
export default DynamicForm
