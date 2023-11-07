import { FC } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'

const ConfirmationModal: FC<ConfirmationModalBaseProps> = ({
  className,
  handleCancel,
  closeModal,
  ...rest
}) => {
  const handleOnCancel = () => {
    if (handleCancel) {
      handleCancel()
    }
    closeModal()
  }
  return (
    <ConfirmationModalBase
      {...rest}
      className={className}
      closeModal={closeModal}
      handleCancel={handleOnCancel}
    />
  )
}

export default ConfirmationModal
