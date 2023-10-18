import { useCallback, useMemo, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { map, filter, isEmpty, includes } from 'lodash'
import {
  InputTypes,
  FormInput,
} from 'components/organisms/DynamicForm/DynamicForm'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ReactComponent as DownloadFilled } from 'assets/icons/download_filled.svg'
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
import { SourceFile } from 'types/orders'
import GenerateForTranslationSection from 'components/molecules/GenerateForTranslationSection/GenerateForTranslationSection'

import classes from './classes.module.scss'

// TODO: very similar to OrderFilesList, these 2 can be unified

interface SourceFilesListProps<TFormValues extends FieldValues> {
  title: string
  name: string
  control: Control<TFormValues>
  tooltipContent?: string
  hiddenIfNoValue?: boolean
  isEditable?: boolean
  className?: string
  catSupported?: boolean
  cat_project_created?: string
  openSendToCatModal?: () => void
}

interface FileRow {
  name: string
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
  catSupported,
  cat_project_created,
  openSendToCatModal,
}: SourceFilesListProps<TFormValues>) => {
  const {
    field: { onChange, value },
  } = useController<TFormValues, Path<TFormValues>>({
    name: name as Path<TFormValues>,
    control,
  })
  const typedValue = value as (File | SourceFile)[]
  const { t } = useTranslation()

  const filesData = useMemo(
    () =>
      map(typedValue, (file, index) => ({
        check: index,
        name: file.name,
        updated_at:
          'updated_at' in file
            ? dayjs(file?.updated_at).format('DD.MM.YYYY HH:mm')
            : '',
        download_button: index,
        delete_button: index,
      })),
    [typedValue]
  )

  const handleDelete = useCallback(
    (index?: number) => {
      if (index === 0 || index) {
        onChange(filter(typedValue, (_, fileIndex) => index !== fileIndex))
      }
    },
    [onChange, typedValue]
  )

  const columns = [
    ...(catSupported
      ? [
          columnHelper.accessor('check', {
            header: '',
            footer: (info) => info.column.id,
            cell: ({ getValue, row }) => {
              console.log(row)
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
    columnHelper.accessor('updated_at', {
      header: () => t('label.updated_at'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('download_button', {
      header: '',
      cell: ({ getValue }) => {
        const file = typedValue?.[getValue()]
        const localFileUrl =
          file instanceof File ? URL.createObjectURL(file) : ''
        const fileUrl =
          'original_url' in file ? file.original_url : localFileUrl
        console.log('fileUrl', fileUrl, file, localFileUrl)
        return (
          <BaseButton
            className={classNames(classes.iconButton, classes.downloadButton)}
            href={fileUrl}
            target="_blank"
            download={file.name}
          >
            <Download />
          </BaseButton>
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('delete_button', {
      header: '',
      cell: ({ getValue }) => {
        return (
          <BaseButton
            className={classes.iconButton}
            onClick={() => handleDelete(getValue())}
          >
            <Delete />
          </BaseButton>
        )
      },
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<FileRow>[]

  if (hiddenIfNoValue && isEmpty(value)) {
    return null
  }

  // TODO: possibly not needed
  if (!isEditable) {
    return (
      <div className={classes.altFilesContainer}>
        <h3>{title}</h3>
        {map(typedValue, (file, index) => {
          const localFileUrl =
            file instanceof File ? URL.createObjectURL(file) : ''
          const fileUrl =
            'original_url' in file ? file.original_url : localFileUrl
          const updatedAt =
            'updated_at' in file
              ? dayjs(file?.updated_at).format('DD.MM.YYYY HH:mm')
              : ''
          return (
            <Fragment key={fileUrl || index}>
              <label>{file.name}</label>
              <span>{updatedAt}</span>
              <BaseButton href={fileUrl} target="_blank" download={file.name}>
                <DownloadFilled />
              </BaseButton>
            </Fragment>
          )
        })}
      </div>
    )
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
              hidden={!isEditable}
              isFilesListHidden
              files={value}
              inputFileTypes={ProjectFileTypes}
              className={classes.fileImportButton}
              onChange={onChange}
              allowMultiple
            />
          </div>
        }
      />
      <GenerateForTranslationSection
        // hidden={!catSupported || !!cat_project_created}
        openSendToCatModal={openSendToCatModal}
        className={classes.generateSection}
      />
    </div>
  )
}

export default SourceFilesList
