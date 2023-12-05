import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { map, filter } from 'lodash'
import {
  InputTypes,
  FormInput,
} from 'components/organisms/DynamicForm/DynamicForm'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ReactComponent as DownloadFilled } from 'assets/icons/download_filled.svg'
import {
  Control,
  FieldValues,
  Path,
  useController,
  useWatch,
} from 'react-hook-form'
import classNames from 'classnames'
import FileImport, {
  ProjectFileTypes,
} from 'components/organisms/FileImport/FileImport'
import dayjs from 'dayjs'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'
import { SourceFile, SubProjectFeatures } from 'types/projects'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'

import classes from './classes.module.scss'
import { showValidationErrorMessage } from 'api/errorHandler'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { useHandleFiles } from 'hooks/requests/useFiles'
import { ProjectDetailModes } from 'components/organisms/ProjectDetails/ProjectDetails'
import { useSendSubProjectFinalFiles } from 'hooks/requests/useProjects'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
interface FinalFilesListProps<TFormValues extends FieldValues> {
  title: string
  name: string
  control: Control<TFormValues>
  tooltipContent?: string
  isEditable?: boolean
  className?: string
  isLoading?: boolean
  mode?: ProjectDetailModes
  subProjectId: string
  isHistoryView?: string
}
interface FileRow {
  name: string
  is_project_final_file: number
  feature: SubProjectFeatures
  created_at: string
  delete_button?: number
  download_button: number
}

const columnHelper = createColumnHelper<FileRow>()

const FinalFilesList = <TFormValues extends FieldValues>({
  title,
  name,
  control,
  tooltipContent,
  isEditable,
  className,
  isLoading,
  subProjectId,
  mode,
  isHistoryView,
}: FinalFilesListProps<TFormValues>) => {
  const { t } = useTranslation()

  const {
    field: { onChange },
    fieldState: { isDirty },
  } = useController<TFormValues, Path<TFormValues>>({
    name: name as Path<TFormValues>,
    control,
  })

  const value = useWatch({
    control,
  }).final_files

  const { sendFinalFiles, isLoading: isSendingFinalFiles } =
    useSendSubProjectFinalFiles({ id: subProjectId })

  const typedValue = value as SourceFile[]

  const { addFiles, deleteFile, downloadFile } = useHandleFiles({
    reference_object_id: subProjectId,
    reference_object_type: 'subproject',
    collection: 'final',
  })

  const handleDownload = useCallback(
    (index: number) => {
      downloadFile(typedValue[index])
    },
    [downloadFile, typedValue]
  )

  const handleAdd = useCallback(
    async (files: (File | SourceFile)[]) => {
      const filteredFiles = filter(files, (f) => !('id' in f)) as File[]
      const { data } = await addFiles(filteredFiles)
      onChange([...value, ...data.data])
    },
    [onChange, addFiles, value]
  )

  const handleOpenDeleteModal = useCallback(
    (index?: number) => {
      const handleDelete = () => {
        if (index === 0 || index) {
          deleteFile(typedValue[index].id)
          onChange(filter(typedValue, (_, fileIndex) => index !== fileIndex))
        }
      }

      showModal(ModalTypes.ConfirmationModal, {
        title: t('modal.confirm_deleting_file'),
        cancelButtonContent: t('button.quit_alt'),
        proceedButtonContent: t('button.confirm'),
        handleProceed: handleDelete,
      })
    },
    [deleteFile, onChange, t, typedValue]
  )

  const filesData = useMemo(
    () =>
      map(typedValue, (file, index) => ({
        is_project_final_file: index,
        name: file.name,
        created_at:
          'created_at' in file
            ? dayjs(file?.created_at).format('DD.MM.YYYY HH:mm')
            : '',
        download_button: index,
        delete_button: index,
        // TODO: feature missing, not sure what field value will be or where it comes from
        feature: SubProjectFeatures.JobRevision,
      })),
    [typedValue]
  )

  const handleSendFilesToClient = useCallback(async () => {
    try {
      const filesToShare = filter(typedValue, 'is_project_final_file')

      await sendFinalFiles({
        final_file_id: map(filesToShare, 'id'),
      })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.files_sent_to_client'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [sendFinalFiles, t, typedValue])

  const columns = [
    ...(mode !== ProjectDetailModes.View
      ? [
          columnHelper.accessor('is_project_final_file', {
            header: () => t('label.shared_with_client'),
            footer: (info) => info.column.id,
            cell: ({ getValue }) => {
              return (
                <FormInput
                  name={
                    `final_files.${getValue()}.is_project_final_file` as Path<TFormValues>
                  }
                  ariaLabel={t('label.share_with_client')}
                  control={control}
                  inputType={InputTypes.Checkbox}
                />
              )
            },
          }),
        ]
      : []),
    columnHelper.accessor('name', {
      header: () => (
        <p className={mode === ProjectDetailModes.View ? classes.header : ''}>
          {t('label.file_name')}
        </p>
      ),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const fileName = getValue()
        return (
          <p
            className={mode === ProjectDetailModes.View ? classes.fileName : ''}
          >
            {fileName}
          </p>
        )
      },
    }),

    columnHelper.accessor('feature', {
      header: () => (
        <p hidden={mode === ProjectDetailModes.View}>{t('label.task')}</p>
      ),
      footer: (info) => {
        if (mode === ProjectDetailModes.View) return null
        return info.column.id
      },
      cell: ({ getValue }) => {
        const selectedFeature = getValue()
        if (mode === ProjectDetailModes.View) return null
        return t(`projects.features.${selectedFeature}`)
      },
    }),
    columnHelper.accessor('created_at', {
      header: () => (
        <p className={mode === ProjectDetailModes.View ? classes.header : ''}>
          {t('label.added_at')}
        </p>
      ),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const createdAt = getValue()
        return (
          <p
            className={
              mode === ProjectDetailModes.View ? classes.createdAt : ''
            }
          >
            {createdAt}
          </p>
        )
      },
    }),
    ...(mode !== ProjectDetailModes.View
      ? [
          columnHelper.accessor('download_button', {
            header: '',
            cell: ({ getValue }) => {
              return (
                <BaseButton
                  className={classNames(
                    classes.iconButton,
                    classes.downloadButton,
                    !!isHistoryView && classes.disabled
                  )}
                  onClick={() => handleDownload(getValue())}
                  disabled={!!isHistoryView}
                >
                  <DownloadFilled className={classes.iconButton} />
                </BaseButton>
              )
            },
            footer: (info) => info.column.id,
          }),
        ]
      : []),

    ...(isEditable || mode === ProjectDetailModes.View
      ? [
          columnHelper.accessor('delete_button', {
            header: '',
            cell: ({ getValue }) => {
              return (
                <BaseButton
                  className={classNames(
                    classes.iconButton,
                    !!isHistoryView && classes.disabled
                  )}
                  onClick={() => handleOpenDeleteModal(getValue())}
                  disabled={!!isHistoryView}
                  aria-label={t('button.delete')}
                >
                  <Delete />
                </BaseButton>
              )
            },
            footer: (info) => info.column.id,
          }),
        ]
      : []),
  ] as ColumnDef<FileRow>[]

  return (
    <div className={classNames(classes.container, className)}>
      <DataTable
        data={filesData}
        columns={columns}
        tableSize={TableSizeTypes.M}
        className={classNames(
          classes.filesListContainer,
          classes.increasedSpecificity
        )}
        hidePagination
        headComponent={
          <div className={classes.titleRow}>
            <h3>{title}</h3>

            <SmallTooltip
              hidden={!tooltipContent || !isEditable}
              tooltipContent={tooltipContent}
            />
            <FileImport
              fileButtonText={t('button.add_new_file')}
              hidden={!isEditable}
              isFilesListHidden
              files={value}
              inputFileTypes={ProjectFileTypes}
              className={classes.fileImportButton}
              onChange={handleAdd}
              allowMultiple
              disabled={!!isHistoryView}
            />
          </div>
        }
      />
      <Button
        appearance={AppearanceTypes.Primary}
        className={classes.saveButton}
        onClick={handleSendFilesToClient}
        disabled={!isDirty || !isEditable}
        loading={isLoading || isSendingFinalFiles}
        hidden={mode === ProjectDetailModes.View}
      >
        {t('button.save_changes')}
      </Button>
      <span
        className={classes.saveHelper}
        hidden={mode === ProjectDetailModes.View}
      >
        {t('helper.save_files_helper')}
      </span>
    </div>
  )
}

export default FinalFilesList
