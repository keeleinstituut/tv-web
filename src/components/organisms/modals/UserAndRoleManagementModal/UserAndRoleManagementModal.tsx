import { FC, ReactElement } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'

export interface UserAndRoleManagementModalProps
  extends ConfirmationModalBaseProps {
  dynamicForm?: ReactElement
}

const UserAndRoleManagementModal: FC<UserAndRoleManagementModalProps> = ({
  modalContent,
  dynamicForm,
  ...rest
}) => {
  return (
    <ConfirmationModalBase
      {...rest}
      modalContent={
        <>
          <div>{modalContent}</div>
          {dynamicForm}
        </>
      }
    />
  )
}

export default UserAndRoleManagementModal
