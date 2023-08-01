import { FC } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'

export type UserAndRoleManagementModalProps = ConfirmationModalBaseProps

const UserAndRoleManagementModal: FC<UserAndRoleManagementModalProps> = ({
  ...rest
}) => {
  return <ConfirmationModalBase {...rest} />
}

export default UserAndRoleManagementModal
