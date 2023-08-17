import { useCallback, useMemo, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import { map, filter, size, isEmpty } from 'lodash'
import {
  InputTypes,
  FormInput,
} from 'components/organisms/DynamicForm/DynamicForm'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ReactComponent as DownloadFilled } from 'assets/icons/download_filled.svg'
import { Control, FieldValues, Path, useController } from 'react-hook-form'
import { ClassifierValueType } from 'types/classifierValues'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import {
  DropDownOptions,
  DropdownSizeTypes,
} from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import classNames from 'classnames'
import FileImport, {
  InputFileTypes,
} from 'components/organisms/FileImport/FileImport'
import dayjs from 'dayjs'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import SmallTooltip from '../SmallTooltip/SmallTooltip'
import { SourceFile } from 'types/orders'

const ProjectFileTypes = [
  InputFileTypes.Pdf,
  InputFileTypes.Doc,
  InputFileTypes.Docx,
  InputFileTypes.OpenDocument,
  InputFileTypes.Excel,
  InputFileTypes.SpreadSheet,
  InputFileTypes.Outlook,
  InputFileTypes.Asice,
  InputFileTypes.Zip,
  InputFileTypes.Zip7,
  InputFileTypes.Png,
  InputFileTypes.Rtf,
  InputFileTypes.Eml,
  InputFileTypes.Ods,
  InputFileTypes.Jpeg,
  InputFileTypes.Text,
  InputFileTypes.Html,
  InputFileTypes.Xml,
  InputFileTypes.TextXml,
  InputFileTypes.Other,
]

interface FilesListProps<TFormValues extends FieldValues> {
  title: string
  typeOptions?: DropDownOptions[]
  name: string
  control: Control<TFormValues>
  tooltipContent?: string
  hiddenIfNoValue?: boolean
  isEditable?: boolean
}

interface FileRow {
  name: string
  help_file_types?: number
  added: string
  delete_button?: number
}

const columnHelper = createColumnHelper<FileRow>()

const FilesList = <TFormValues extends FieldValues>({
  title,
  typeOptions,
  name,
  control,
  tooltipContent,
  hiddenIfNoValue,
  isEditable,
}: FilesListProps<TFormValues>) => {
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
        name: file.name,
        help_file_types: index,
        added:
          'updated_at' in file
            ? dayjs(file?.updated_at).format('DD.MM.YYYY HH:mm')
            : '',
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
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('help_file_types', {
      header: name === 'help_files' ? t('label.file_type') : '',
      cell: ({ column, getValue }) => {
        const errorZIndex = size(filesData) - column.depth
        if (name === 'help_files') {
          return (
            <FormInput
              name={`help_file_types.${getValue()}` as Path<TFormValues>}
              ariaLabel={t('label.file_type')}
              placeholder={t('placeholder.pick')}
              control={control}
              options={typeOptions || []}
              inputType={InputTypes.Selections}
              errorZIndex={errorZIndex}
              dropdownSize={DropdownSizeTypes.M}
              className={classes.fitContent}
              usePortal
              horizontalScrollContainerId="tableWrapper"
            />
          )
        }
        return null
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('delete_button', {
      header: '',
      cell: ({ getValue }) => {
        return (
          <BaseButton onClick={() => handleDelete(getValue())}>
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
    <DataTable
      data={filesData}
      columns={columns}
      tableSize={TableSizeTypes.M}
      className={classNames(
        classes.filesListContainer,
        isEmpty(filesData) && classes.hiddenContent
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
            fileButtonText={t('button.add_file')}
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
  )
}

interface FilesSectionProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>
  isEditable?: boolean
}

const FilesSection = <TFormValues extends FieldValues>({
  control,
  isEditable,
}: FilesSectionProps<TFormValues>) => {
  const { t } = useTranslation()
  const { classifierValuesFilters: fileTypeFilters } = useClassifierValuesFetch(
    {
      type: ClassifierValueType.FileType,
    }
  )

  return (
    <div className={classes.container}>
      <h2>{isEditable ? '' : t('orders.files')}</h2>
      <FilesList
        name="source_files"
        title={t('orders.source_files')}
        tooltipContent={t('tooltip.file_format_helper')}
        control={control}
        isEditable={isEditable}
      />
      <FilesList
        title={t('orders.help_files')}
        control={control}
        name="help_files"
        typeOptions={fileTypeFilters}
        isEditable={isEditable}
      />
      {/* TODO: currently not sure where these come from */}
      <FilesList
        title={t('orders.feedback_files')}
        control={control}
        name="feedback_files"
        typeOptions={fileTypeFilters}
        hiddenIfNoValue
        isEditable={isEditable}
      />
    </div>
  )
}

export default FilesSection
