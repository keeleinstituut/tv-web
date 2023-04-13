import { useCallback, forwardRef, Suspense } from 'react'
import { ControllerProps } from 'react-hook-form'
import { omit } from 'lodash'
import { SimpleUnionOmit } from 'types/helpers'
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
    const { inputType } = props

    const inputsByType = {
      [InputTypes.Text]: <TextInput {...omit(props, 'inputType')} ref={ref} />,
      [InputTypes.Checkbox]: (
        <CheckBoxInput {...omit(props, 'inputType')} ref={ref} />
      ),
    }

    return inputsByType[inputType]
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
