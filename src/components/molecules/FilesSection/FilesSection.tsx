import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import { map, filter, size, isEmpty } from 'lodash'
import {
  InputTypes,
  FormInput,
} from 'components/organisms/DynamicForm/DynamicForm'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
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
}: FilesListProps<TFormValues>) => {
  const {
    field: { onChange, value },
  } = useController<TFormValues, Path<TFormValues>>({
    name: name as Path<TFormValues>,
    control,
  })
  const typedValue = value as File[]
  const { t } = useTranslation()

  const filesData = useMemo(
    () =>
      map(typedValue, (file, index) => ({
        name: file.name,
        help_file_types: index,
        added: dayjs(file.lastModified).format('DD.MM.YYYY hh:mm'),
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
            hidden={!tooltipContent}
            tooltipContent={tooltipContent}
          />
          <FileImport
            fileButtonText={t('button.add_file')}
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
}

const FilesSection = <TFormValues extends FieldValues>({
  control,
}: FilesSectionProps<TFormValues>) => {
  const { t } = useTranslation()
  const { classifierValuesFilters: fileTypeFilters } = useClassifierValuesFetch(
    {
      type: ClassifierValueType.FileType,
    }
  )

  return (
    <div className={classes.container}>
      <FilesList
        name="source_files"
        title={t('orders.source_files')}
        tooltipContent={t('tooltip.file_format_helper')}
        control={control}
      />
      <FilesList
        title={t('orders.help_files')}
        control={control}
        name="help_files"
        typeOptions={fileTypeFilters}
      />
    </div>
  )
}

export default FilesSection
