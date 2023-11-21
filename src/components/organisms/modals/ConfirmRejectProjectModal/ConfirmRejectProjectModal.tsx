import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { closeModal } from '../ModalRoot'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from '../ConfirmationModalBase/ConfirmationModalBase'
import { SubmitHandler, useForm } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import classes from './classes.module.scss'
import { useCompleteTask } from 'hooks/requests/useTasks'
import FileImport, {
  ProjectFileTypes,
} from 'components/organisms/FileImport/FileImport'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'

export interface ConfirmRejectProjectModalProps
  extends ConfirmationModalBaseProps {
  projectId?: string
  taskId?: string
  subProjectsOptions?: DropDownOptions[]
}

interface FormValues {
  sub_projects: string[]
  comments: string
  files: File[]
}

const ConfirmRejectProjectModal: FC<ConfirmRejectProjectModalProps> = ({
  projectId,
  taskId,
  isModalOpen,
  subProjectsOptions,
}) => {
  const { t } = useTranslation()

  const { completeTask, isLoading: isCompletingTask } = useCompleteTask({
    id: taskId,
  })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<FormValues>({
    reValidateMode: 'onChange',
  })

  const files = watch('files')

  const handleAdd = useCallback(
    async (newFiles: File[]) => {
      setValue('files', [...files, ...newFiles])
    },
    [files, setValue]
  )

  const formFields: FieldProps<FormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.Selections,
        ariaLabel: `${t('label.pick_sub_project')}*`,
        placeholder: t('placeholder.pick'),
        label: `${t('label.pick_sub_project')}*`,
        name: 'sub_projects',
        className: classes.selection,
        options: subProjectsOptions || [],
        rules: {
          required: true,
        },
      },
      {
        component: (
          <FileImport
            fileButtonText={t('button.add_file')}
            fileButtonChangeText={t('button.change_files')}
            inputFileTypes={ProjectFileTypes}
            listContainerClassName={classes.filesList}
            files={files}
            className={classes.fileImportButton}
            onChange={handleAdd}
            allowMultiple
          />
        ),
      },
      {
        inputType: InputTypes.Text,
        label: `${t('label.extra_information')}*`,
        ariaLabel: `${t('label.extra_information')}*`,
        placeholder: t('placeholder.extra_information'),
        name: 'comments',
        className: classes.commentInput,
        isTextarea: true,
        rules: {
          required: true,
        },
        rows: 3,
      },
    ],
    [files, handleAdd, subProjectsOptions, t]
  )

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      await completeTask(values)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.project_rejected'),
      })
      closeModal()
    },
    [completeTask, t]
  )

  return (
    <ConfirmationModalBase
      isModalOpen={isModalOpen}
      handleProceed={handleSubmit(onSubmit)}
      proceedButtonDisabled={!isValid}
      cancelButtonContent={t('button.cancel')}
      proceedButtonContent={t('button.send')}
      title={t('modal.confirm_project_rejection_title')}
      helperText={t('modal.confirm_project_rejection_helper')}
      proceedButtonLoading={isCompletingTask}
      closeModal={closeModal}
      modalContent={
        <DynamicForm
          control={control}
          fields={formFields}
          className={classes.formWrapper}
        />
      }
    />
  )
}

export default ConfirmRejectProjectModal
