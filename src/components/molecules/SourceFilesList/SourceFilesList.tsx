import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { map, filter, isEmpty, includes } from 'lodash'
import {
  InputTypes,
  FormInput,
} from 'components/organisms/DynamicForm/DynamicForm'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ReactComponent as Download } from 'assets/icons/download.svg'
import { Control, FieldValues, Path, useController } from 'react-hook-form'
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
import { SourceFile, CatProjectStatus } from 'types/projects'
import GenerateForTranslationSection from 'components/molecules/GenerateForTranslationSection/GenerateForTranslationSection'

import classes from './classes.module.scss'
import { useHandleFiles } from 'hooks/requests/useFiles'
import { ProjectDetailModes } from 'components/organisms/ProjectDetails/ProjectDetails'

// TODO: very similar to ProjectFilesList, these 2 can be unified

interface SourceFilesListProps<TFormValues extends FieldValues> {
  title: string
  name: string
  control: Control<TFormValues>
  tooltipContent?: string
  hiddenIfNoValue?: boolean
  isEditable?: boolean
  subProjectId: string
  className?: string
  openSendToCatModal?: () => void
  canGenerateProject?: boolean
  isCatProjectLoading?: boolean
  isGenerateProjectButtonDisabled?: boolean
  catSetupStatus?: CatProjectStatus
  mode?: ProjectDetailModes
  isHistoryView?: string
}

interface FileRow {
  name: string
  category?: string
  updated_at: string
  delete_button?: number
  check: number
  download_button: number
}

const columnHelper = createColumnHelper<FileRow>()

const SourceFilesList = <TFormValues extends FieldValues>({
  title,
  name,
  control,
  tooltipContent,
  hiddenIfNoValue,
  isEditable,
  className,
  canGenerateProject,
  openSendToCatModal,
  isCatProjectLoading,
  subProjectId,
  isGenerateProjectButtonDisabled,
  catSetupStatus,
  mode,
  isHistoryView,
}: SourceFilesListProps<TFormValues>) => {
  const {
    field: { onChange, value },
  } = useController<TFormValues, Path<TFormValues>>({
    name: name as Path<TFormValues>,
    control,
  })

  const { addFiles, deleteFile, downloadFile } = useHandleFiles({
    reference_object_id: subProjectId,
    reference_object_type: 'subproject',
    collection: 'source',
  })

  const typedValue = value as SourceFile[]
  const { t } = useTranslation()

  const filesData = useMemo(
    () =>
      map(typedValue, (file, index) => {
        return {
          key: index,
          check: index,
          name: file.name,
          updated_at:
            'updated_at' in file
              ? dayjs(file?.updated_at).format('DD.MM.YYYY HH:mm')
              : '',
          category: file.collection_name, // TODO: Add correct data from BE, currently not yet implemented
          download_button: index,
          delete_button: index,
        }
      }),
    [typedValue]
  )

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

  const handleDelete = useCallback(
    (index?: number) => {
      if (index === 0 || index) {
        deleteFile(typedValue[index].id)
        onChange(filter(typedValue, (_, fileIndex) => index !== fileIndex))
      }
    },
    [onChange, deleteFile, typedValue]
  )

  const columns = [
    ...((canGenerateProject && isEditable) ||
    (canGenerateProject && mode !== ProjectDetailModes.View)
      ? [
          columnHelper.accessor('check', {
            header: '',
            footer: (info) => info.column.id,
            cell: ({ getValue, row }) => {
              return (
                <FormInput
                  name={`${name}.${row.id}.isChecked` as Path<TFormValues>}
                  ariaLabel={t('label.file_type')}
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
      header: () => t('label.file_name'),
      footer: (info) => info.column.id,
      cell: ({ getValue, row }) => {
        const rowIndex = row.original.download_button
        const relatedFile = typedValue[rowIndex]
        const mimeType =
          //@ts-expect-error mime_type is not present in actual SourceFile also,
          // this should be looked into
          'mime_type' in relatedFile ? relatedFile.mime_type : relatedFile.type
        const isPdf = includes(mimeType, 'pdf')
        return (
          <div className={classes.row}>
            {getValue()}
            <SmallTooltip
              hidden={!isPdf}
              tooltipContent={t('tooltip.file_format_helper')}
              className={classes.innerTooltip}
            />
          </div>
        )
      },
    }),
    ...(mode === ProjectDetailModes.View
      ? [
          columnHelper.accessor('category', {
            header: () => t('label.category'), // TODO: Add correct data from BE, currently not yet implemented
            footer: (info) => info.column.id,
          }),
        ]
      : []),
    columnHelper.accessor('updated_at', {
      header: () => t('label.updated_at'),
      footer: (info) => info.column.id,
    }),
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
            target="_blank"
            onClick={() => handleDownload(getValue())}
            disabled={!!isHistoryView}
          >
            <Download />
          </BaseButton>
        )
      },
      footer: (info) => info.column.id,
    }),
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
                  onClick={() => handleDelete(getValue())}
                  disabled={!!isHistoryView}
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

  if (hiddenIfNoValue && isEmpty(value)) {
    return null
  }

  return (
    <div className={classNames(classes.container, className)}>
      <DataTable
        data={filesData}
        columns={columns}
        tableSize={TableSizeTypes.M}
        className={classes.filesListContainer}
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
              hidden={!isEditable || mode === ProjectDetailModes.View}
              isFilesListHidden
              files={value}
              inputFileTypes={ProjectFileTypes}
              className={classes.fileImportButton}
              onChange={handleAdd}
              allowMultiple
            />
          </div>
        }
      />
      <GenerateForTranslationSection
        hidden={
          !canGenerateProject || mode === ProjectDetailModes.View || !isEditable
        }
        openSendToCatModal={openSendToCatModal}
        className={classes.generateSection}
        disabled={isGenerateProjectButtonDisabled}
        isLoading={isCatProjectLoading}
        catSetupStatus={catSetupStatus}
      />
    </div>
  )
}

export default SourceFilesList
