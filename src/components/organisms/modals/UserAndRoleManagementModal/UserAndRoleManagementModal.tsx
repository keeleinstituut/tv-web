<<<<<<<< HEAD:src/components/organisms/modals/RemoveModal/RemoveModal.tsx
import { FC, JSXElementConstructor, ReactElement } from 'react'
========
import { FC, ReactElement } from 'react'
>>>>>>>> dev:src/components/organisms/modals/UserAndRoleManagementModal/UserAndRoleManagementModal.tsx
import { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { useTranslation } from 'react-i18next'

<<<<<<<< HEAD:src/components/organisms/modals/RemoveModal/RemoveModal.tsx
export interface RemoveModalProps {
  title?: string
  cancelButtonContent?: string
  proceedButtonContent?: string
  modalContent?:
    | string
    | ReactElement<unknown, string | JSXElementConstructor<unknown>>
    | undefined
========
export interface UserAndRoleManagementModalProps {
  title?: string
  cancelButtonContent?: string
  proceedButtonContent?: string
  modalContent?: string | ReactElement
>>>>>>>> dev:src/components/organisms/modals/UserAndRoleManagementModal/UserAndRoleManagementModal.tsx
  isModalOpen?: boolean
  closeModal: () => void
  handleProceed?: () => void
  className?: string
  deactivationForm?: JSX.Element
}

<<<<<<<< HEAD:src/components/organisms/modals/RemoveModal/RemoveModal.tsx
const RemoveModal: FC<RemoveModalProps> = ({
========
const UserAndRoleManagementModal: FC<UserAndRoleManagementModalProps> = ({
>>>>>>>> dev:src/components/organisms/modals/UserAndRoleManagementModal/UserAndRoleManagementModal.tsx
  title,
  cancelButtonContent,
  proceedButtonContent,
  modalContent,
  isModalOpen,
  closeModal,
  handleProceed,
  className,
  deactivationForm,
}) => {
<<<<<<<< HEAD:src/components/organisms/modals/RemoveModal/RemoveModal.tsx
========
  const { t } = useTranslation()
>>>>>>>> dev:src/components/organisms/modals/UserAndRoleManagementModal/UserAndRoleManagementModal.tsx
  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      className={className}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: cancelButtonContent || t('button.no'),
          size: SizeTypes.M,
          onClick: closeModal,
        },
        {
          appearance: AppearanceTypes.Primary,
          onClick: () => {
            if (handleProceed) {
              handleProceed()
            }
            closeModal()
          },
          children: proceedButtonContent || t('button.yes'),
        },
      ]}
    >
      <div>{modalContent}</div>
      {deactivationForm}
    </ModalBase>
  )
}

<<<<<<<< HEAD:src/components/organisms/modals/RemoveModal/RemoveModal.tsx
export default RemoveModal
========
export default UserAndRoleManagementModal
>>>>>>>> dev:src/components/organisms/modals/UserAndRoleManagementModal/UserAndRoleManagementModal.tsx
