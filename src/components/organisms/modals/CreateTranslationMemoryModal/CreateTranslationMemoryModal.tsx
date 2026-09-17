import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { ModalSizeTypes } from 'components/organisms/ModalBase/ModalBase'
import { closeModal } from '../ModalRoot'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from '../ConfirmationModalBase/ConfirmationModalBase'
import TranslationMemoryForm, {
  TranslationMemoryFormState,
} from 'components/organisms/forms/TranslationMemoryForm/TranslationMemoryForm'
import {
  useCatProject,
  useUpdateCatProjectTranslationMemories,
} from 'components/organisms/features/CatToolFeature/useCatTranslationMemories'

export type CreateTranslationMemoryModalProps = {
  catProjectId: string
  prefill?: {
    name?: string
    source_locale?: string
    target_locale?: string
    tv_domain?: string
  }
} & ConfirmationModalBaseProps

const noop = () => {}

const CreateTranslationMemoryModal: FC<CreateTranslationMemoryModalProps> = ({
  catProjectId,
  prefill,
  ...rest
}) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const catProjectQuery = useCatProject(catProjectId)
  const { mutateAsync: updateCatProjectTms } =
    useUpdateCatProjectTranslationMemories(catProjectId)
  const [formState, setFormState] = useState<TranslationMemoryFormState>({
    submit: noop,
    isValid: false,
    isLoading: false,
  })

  const handleSuccess = async (tm: { id: string }) => {
    const assigned: { id: string; read: boolean; write: boolean }[] =
      catProjectQuery.data?.data?.translation_memories || []

    await updateCatProjectTms([
      ...assigned.map(({ id, read, write }) => ({ id, read, write })),
      { id: tm.id, read: true, write: false },
    ])
    queryClient.invalidateQueries({ queryKey: ['catTranslationMemories'] })
    closeModal()
  }

  return (
    <ConfirmationModalBase
      {...rest}
      title={t('translation_memories.new_translation_memory_title')}
      size={ModalSizeTypes.Small}
      closeModal={closeModal}
      cancelButtonContent={t('button.cancel')}
      cancelButtonDisabled={formState.isLoading}
      proceedButtonContent={t('button.create_translation_memory')}
      proceedButtonDisabled={!formState.isValid}
      proceedButtonLoading={formState.isLoading}
      handleProceed={formState.submit}
      modalContent={
        <TranslationMemoryForm
          onSuccess={handleSuccess}
          prefill={prefill}
          onFormStateChange={setFormState}
          inModal
        />
      }
    />
  )
}

export default CreateTranslationMemoryModal
