import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { closeModal } from '../ModalRoot'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from '../ConfirmationModalBase/ConfirmationModalBase'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import { useProjectCache, useUpdateProject } from 'hooks/requests/useProjects'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import PersonSection, {
  PersonSectionTypes,
} from 'components/molecules/PersonSection/PersonSection'
import { Form } from '@radix-ui/react-form'
import { ValidationError } from 'api/errorHandler'
import { join, map } from 'lodash'

export interface ReassignProjectModalProps extends ConfirmationModalBaseProps {
  projectId?: string
}

interface FormValues {
  manager_institution_user_id: string
}

const ReassignProjectModal: FC<ReassignProjectModalProps> = ({
  projectId,
  isModalOpen,
}) => {
  const { t } = useTranslation()
  const { updateProject, isLoading: isUpdatingProject } = useUpdateProject({
    id: projectId,
  })

  const { manager_institution_user } = useProjectCache(projectId) || {}

  const {
    control,
    handleSubmit,
    setError,
    formState: { isValid, isDirty },
  } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: {
      manager_institution_user_id: manager_institution_user?.id,
    },
  })

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      try {
        await updateProject(values)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.project_reassigned'),
        })
        closeModal()
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
            setError(typedKey, { type: 'backend', message: errorString })
          })
        }
      }
    },
    [updateProject, t, setError]
  )

  return (
    <ConfirmationModalBase
      isModalOpen={isModalOpen}
      handleProceed={handleSubmit(onSubmit)}
      proceedButtonDisabled={!isValid || !isDirty}
      cancelButtonContent={t('button.quit_alt')}
      proceedButtonContent={t('button.reassign')}
      title={t('modal.reassign_project_title')}
      helperText={t('modal.reassign_project_helper')}
      proceedButtonLoading={isUpdatingProject}
      closeModal={closeModal}
      modalContent={
        <Form>
          <PersonSection
            type={PersonSectionTypes.Manager}
            control={control}
            selectedUser={manager_institution_user}
            hideDetails
            isEditable
          />
        </Form>
      }
    />
  )
}

export default ReassignProjectModal
