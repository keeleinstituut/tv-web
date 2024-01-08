import { FC, useCallback, useMemo } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { useTranslation } from 'react-i18next'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { SubmitHandler, useForm } from 'react-hook-form'
import { find, isEmpty, keys, map, pickBy, reduce } from 'lodash'
import { useCompleteAssignment } from 'hooks/requests/useAssignments'
import { useSubProjectCache } from 'hooks/requests/useProjects'

export interface ConfirmAssignmentCompletionModalProps
  extends ConfirmationModalBaseProps {
  sub_project_id?: string
  id?: string
}

interface FormValues {
  selected_final_files: { [key: string]: boolean }
}

const ConfirmAssignmentCompletionModal: FC<
  ConfirmAssignmentCompletionModalProps
> = ({ closeModal, sub_project_id, id, ...rest }) => {
  const { t } = useTranslation()
  const subProject = useSubProjectCache(sub_project_id)

  // const { subProject } = useFetchSubProject({ id: sub_project_id })
  const { final_files } = subProject || {}
  const { control, handleSubmit, watch } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: {
      selected_final_files: reduce(
        final_files || [],
        (result, file) => {
          if (!file) return result
          return {
            ...result,
            [file?.id]: !!file?.is_project_final_file,
          }
        },
        {}
      ),
    },
  })

  const selectedFiles = watch('selected_final_files')
  const anySelected = find(selectedFiles, (isSelected) => !!isSelected)

  const { completeAssignment, isLoading: isCompletingAssignment } =
    useCompleteAssignment({
      id,
    })

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const selectedFiles = keys(
        pickBy(values.selected_final_files, (isSelected) => !!isSelected)
      )
      try {
        await completeAssignment({
          final_file_id: selectedFiles,
          accepted: true,
        })
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.translation_memory_updated'),
        })
        closeModal()
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [closeModal, completeAssignment, t]
  )

  const fields: FieldProps<FormValues>[] = useMemo(
    () =>
      map(final_files, ({ id, name }) => ({
        inputType: InputTypes.Checkbox,
        ariaLabel: t('label.pick_volume_type'),
        placeholder: t('placeholder.pick'),
        label: name,
        name: `selected_final_files.${id}`,
      })),
    [final_files, t]
  )

  return (
    <ConfirmationModalBase
      title={t('modal.pick_files_to_forward')}
      cancelButtonContent={t('button.quit_alt')}
      proceedButtonContent={t('button.send')}
      proceedButtonDisabled={isEmpty(final_files) || !anySelected}
      handleProceed={handleSubmit(onSubmit)}
      proceedButtonLoading={isCompletingAssignment}
      helperText={t('modal.forward_files_helper')}
      {...rest}
      closeModal={closeModal}
      modalContent={<DynamicForm control={control} fields={fields} />}
    />
  )
}

export default ConfirmAssignmentCompletionModal
