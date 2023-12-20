import { Fragment, PropsWithChildren } from 'react'
import { map, size } from 'lodash'
import { Root } from '@radix-ui/react-form'
import DynamicInputComponent, {
  InputPropsWithoutControllerProps,
  InputTypes,
} from 'components/organisms/DynamicInputComponent/DynamicInputComponent'
import classNames from 'classnames'

import {
  Controller,
  Control,
  UseControllerProps,
  FieldValues,
} from 'react-hook-form'
import { FormEventHandler, ReactElement } from 'react'

export type InputFieldProps<TFormValues extends FieldValues> =
  UseControllerProps<TFormValues> &
    InputPropsWithoutControllerProps & { hidden?: boolean }

interface ComponentInForm {
  component: Array<ReactElement> | ReactElement | string
  name?: string
  label?: string
}

export type FieldProps<TFormValues extends FieldValues> =
  | InputFieldProps<TFormValues>
  | ComponentInForm

export interface DynamicFormProps<TFormValues extends FieldValues> {
  fields: FieldProps<TFormValues>[]
  control: Control<TFormValues>
  className?: string
  onSubmit?: FormEventHandler<HTMLFormElement>
  formId?: string
  useDivWrapper?: boolean
}

export function FormInput<TFormValues extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  hidden,
  ...rest
}: InputFieldProps<TFormValues>) {
  if (hidden) return null
  return (
    <Controller
      name={name}
      rules={rules}
      shouldUnregister={shouldUnregister}
      defaultValue={defaultValue}
      control={control}
      render={DynamicInputComponent<TFormValues>({
        ...rest,
        rules: rules as { required?: boolean } | undefined,
      })}
    />
  )
}

function DynamicForm<TFormValues extends FieldValues>({
  control,
  fields,
  className,
  onSubmit,
  children,
  useDivWrapper,
  formId,
}: PropsWithChildren<DynamicFormProps<TFormValues>>) {
  const Wrapper = useDivWrapper ? 'div' : Root
  // TODO: workaround for typescript, find a better solution
  const wrapperProps = {
    onSubmit,
  } as unknown as object
  return (
    <Wrapper id={formId} className={classNames(className)} {...wrapperProps}>
      {map(fields, (inputData, index) => {
        // objects inside fields array can either be props needed to render an input
        // or just components that we need to render in the middle of the form
        // Check whether we are dealing with just a component
        if ('component' in inputData) {
          // Render the component
          return <Fragment key={index}>{inputData.component}</Fragment>
        }
        // Else render Input and pass the props
        return (
          <FormInput
            key={inputData.name}
            control={control}
            {...inputData}
            errorZIndex={size(fields) - index}
          />
        )
      })}
      {children}
    </Wrapper>
  )
}

// exporting InputTypes from here for convenience, since they will be used together with DynamicForm
export { InputTypes }
export default DynamicForm
