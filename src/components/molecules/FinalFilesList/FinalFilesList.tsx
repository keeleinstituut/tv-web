import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { map, filter, isEmpty, compact, includes } from 'lodash'
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

// TODO: very similar to ProjectFilesList, these 2 can be unified

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
  shared_with_client: number
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
  const {
    field: { onChange, value },
    formState: { dirtyFields },
  } = useController<TFormValues, Path<TFormValues>>({
    name: name as Path<TFormValues>,
    control,
  })

  const sharedFiles = useWatch({
    control,
    name: 'shared_with_client' as Path<TFormValues>,
  })

  const typedValue = value as SourceFile[]
  const { t } = useTranslation()

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
        shared_with_client: index,
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

  // TODO: following needs to be checked, not sure what the endpoint will be
  // Or what the data structure needed for that endpoint will be
  const handleSendFilesToClient = useCallback(async () => {
    if (sharedFiles && !isEmpty(sharedFiles)) {
      try {
        const indexesToShare = compact(
          map(sharedFiles, (value, index) => {
            if (value) return index
            return null
          })
        )
        const sharedFileIds = map(
          filter(typedValue, (_, index) => includes(indexesToShare, index)),
          'id'
        )
        // await sendFilesToClient(sharedFileIds)
        // showNotification({
        //   type: NotificationTypes.Success,
        //   title: t('notification.announcement'),
        //   content: t('success.files_sent_to_client'),
        // })
      } catch (errorData) {
        // TODO: depending on the errors, we might show them under checkboxes instead
        showValidationErrorMessage(errorData)
      }
    }
    // TODO: handle sending files to client here, based on checked values
  }, [sharedFiles, typedValue])

  const columns = [
    ...(mode !== 'view'
      ? [
          columnHelper.accessor('shared_with_client', {
            header: () => t('label.shared_with_client'),
            footer: (info) => info.column.id,
            cell: ({ getValue }) => {
              return (
                <FormInput
                  name={`shared_with_client.${getValue()}` as Path<TFormValues>}
                  ariaLabel={t('label.share_with_client')}
                  control={control}
                  inputType={InputTypes.Checkbox}
                  // className={classes.fitContent}
                />
              )
            },
          }),
        ]
      : []),
    columnHelper.accessor('name', {
      header: () => (
        <p className={mode === 'view' ? classes.header : ''}>
          {t('label.file_name')}
        </p>
      ),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const fileName = getValue()
        return (
          <p className={mode === 'view' ? classes.fileName : ''}>{fileName}</p>
        )
      },
    }),

    columnHelper.accessor('feature', {
      header: () => <p hidden={mode === 'view'}>{t('label.task')}</p>,
      footer: (info) => {
        if (mode === 'view') return null
        return info.column.id
      },
      cell: ({ getValue }) => {
        const selectedFeature = getValue()
        if (mode === 'view') return null
        return t(`projects.features.${selectedFeature}`)
      },
    }),
    columnHelper.accessor('created_at', {
      header: () => (
        <p className={mode === 'view' ? classes.header : ''}>
          {t('label.added_at')}
        </p>
      ),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const createdAt = getValue()
        return (
          <p className={mode === 'view' ? classes.createdAt : ''}>
            {createdAt}
          </p>
        )
      },
    }),
    columnHelper.accessor('download_button', {
      header: '',
      cell: ({ getValue }) => (
        <BaseButton
          className={classNames(classes.iconButton, classes.downloadButton)}
          onClick={() => handleDownload(getValue())}
        >
          <DownloadFilled />
        </BaseButton>
      ),
      footer: (info) => info.column.id,
    }),
    ...(mode !== 'view'
      ? [
          columnHelper.accessor('download_button', {
            header: '',
            cell: ({ getValue }) => {
              const file = typedValue?.[getValue()]
              const localFileUrl =
                file instanceof File ? URL.createObjectURL(file) : ''
              const fileUrl =
                'original_url' in file ? file.original_url : localFileUrl
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
                  <DownloadFilled />
                </BaseButton>
              )
            },
            footer: (info) => info.column.id,
          }),
        ]
      : []),
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
          >
            <Delete />
          </BaseButton>
        )
      },
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<FileRow>[]

  // TODO: possibly not needed
  // if (!isEditable) {
  //   return (
  //     <div className={classes.altFilesContainer}>
  //       <h3>{title}</h3>
  //       {map(typedValue, (file, index) => {
  //         const localFileUrl =
  //           file instanceof File ? URL.createObjectURL(file) : ''
  //         const fileUrl =
  //           'original_url' in file ? file.original_url : localFileUrl
  //         const updatedAt =
  //           'updated_at' in file
  //             ? dayjs(file?.updated_at).format('DD.MM.YYYY HH:mm')
  //             : ''
  //         return (
  //           <Fragment key={fileUrl || index}>
  //             <label>{file.name}</label>
  //             <span>{updatedAt}</span>
  //             <BaseButton href={fileUrl} target="_blank" download={file.name}>
  //               <DownloadFilled />
  //             </BaseButton>
  //           </Fragment>
  //         )
  //       })}
  //     </div>
  //   )
  // }

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
        disabled={!dirtyFields?.shared_with_client}
        loading={isLoading}
        hidden={mode === 'view'}
      >
        {t('button.save_changes')}
      </Button>
      <span className={classes.saveHelper} hidden={mode === 'view'}>
        {t('helper.save_files_helper')}
      </span>
    </div>
  )
}

export default FinalFilesList
