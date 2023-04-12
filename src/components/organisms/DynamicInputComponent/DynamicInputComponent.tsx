import { useCallback, forwardRef, Suspense } from 'react'
import { omit } from 'lodash'
import { ControllerProps } from 'react-hook-form'
import { assertNever, SimpleUnionOmit } from 'types/helpers'

import TextInput, {
  TextInputProps,
} from 'components/molecules/TextInput/TextInput'
import CheckBoxInput, {
  CheckBoxInputProps,
} from 'components/molecules/CheckBoxInput/CheckBoxInput'

// Extend all props of an input with the corresponding inputType

export enum InputTypes {
  text = 'text',
  checkbox = 'checkbox',
}

interface TextInputPropsWithType extends TextInputProps {
  inputType: InputTypes.text
}

interface CheckBoxInputPropsWithType extends CheckBoxInputProps {
  inputType: InputTypes.checkbox
}

export type InputPropsByType =
  | TextInputPropsWithType
  | CheckBoxInputPropsWithType

export type InputPropsWithoutControllerProps = SimpleUnionOmit<
  InputPropsByType,
  'value' | 'onChange' | 'name' | 'ref'
>

// eslint-disable-next-line react/display-name
const InputComponent = forwardRef<HTMLInputElement, InputPropsByType>(
  (props, ref) => {
    const { inputType } = props

    switch (inputType) {
      case InputTypes.text:
        return <TextInput {...omit(props, 'inputType')} ref={ref} />
      case InputTypes.checkbox:
        return <CheckBoxInput {...omit(props, 'inputType')} ref={ref} />
      default:
        return assertNever(inputType)
    }
  }
)

const DynamicInputComponent = (
  props: InputPropsWithoutControllerProps
): ControllerProps['render'] => {
  const FieldComponent: ControllerProps['render'] = useCallback(
    ({ field, fieldState: { error } }) => {
      return (
        <Suspense fallback={<div />}>
          <InputComponent {...props} {...field} error={error} />
        </Suspense>
      )
    },
    [props]
  )
  return FieldComponent
}

export default DynamicInputComponent
