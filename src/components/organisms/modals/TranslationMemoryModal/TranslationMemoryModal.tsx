import { FC } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { useTranslation } from 'react-i18next'

export type TranslationMemoryModalProps = ConfirmationModalBaseProps

const TranslationMemoryModal: FC<TranslationMemoryModalProps> = ({
  className,
  handleCancel,
  closeModal,
  ...rest
}) => {
  const { t } = useTranslation()

  const handleOnCancel = () => {
    if (handleCancel) {
      handleCancel()
    }
    closeModal()
  }
  return (
    <ConfirmationModalBase
      {...rest}
      closeModal={closeModal}
      handleCancel={handleOnCancel}
      title={t('translation_memories.confirmation_text')}
      cancelButtonContent={t('button.cancel')}
      helperText={t('translation_memories.confirmation_help_text')}
    />
  )
}

export default TranslationMemoryModal
