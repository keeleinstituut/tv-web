import { useCallback, forwardRef, Suspense } from 'react'
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
  Text = 'text',
  Checkbox = 'checkbox',
}

type TextInputPropsWithType = TextInputProps & {
  inputType: InputTypes.Text
}

type CheckBoxInputPropsWithType = CheckBoxInputProps & {
  inputType: InputTypes.Checkbox
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
    const { inputType, ...inputProps } = props

    switch (inputType) {
      case InputTypes.Text:
        return <TextInput {...inputProps} ref={ref} />
      case InputTypes.Checkbox:
        return <CheckBoxInput {...inputProps} ref={ref} />
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
