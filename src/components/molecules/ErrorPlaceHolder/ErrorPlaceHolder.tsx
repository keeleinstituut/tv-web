import InputWrapper, {
  InputWrapperProps,
} from 'components/molecules/InputWrapper/InputWrapper'
import { FC, PropsWithChildren, Ref, useRef } from 'react'

type ErrorPlaceHolderProps = Pick<
  InputWrapperProps,
  'name' | 'error' | 'errorZIndex'
>

const ErrorPlaceHolder: FC<PropsWithChildren<ErrorPlaceHolderProps>> = ({
  children,
  ...rest
}) => {
  const ref = useRef()
  return (
    <InputWrapper ref={ref as unknown as Ref<HTMLInputElement>} {...rest}>
      {children}
    </InputWrapper>
  )
}

export default ErrorPlaceHolder
