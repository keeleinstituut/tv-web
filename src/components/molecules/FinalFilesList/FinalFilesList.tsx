import { useCallback, useMemo, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { map, filter } from 'lodash'
import {
  InputTypes,
  FormInput,
} from 'components/organisms/DynamicForm/DynamicForm'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ReactComponent as DownloadFilled } from 'assets/icons/download_filled.svg'
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
import { SourceFile, SubProjectFeatures } from 'types/orders'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'

import classes from './classes.module.scss'

// TODO: very similar to OrderFilesList, these 2 can be unified

interface FinalFilesListProps<TFormValues extends FieldValues> {
  title: string
  name: string
  control: Control<TFormValues>
  tooltipContent?: string
  isEditable?: boolean
  className?: string
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
}: FinalFilesListProps<TFormValues>) => {
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

  const handleDelete = useCallback(
    (index?: number) => {
      if (index === 0 || index) {
        onChange(filter(typedValue, (_, fileIndex) => index !== fileIndex))
      }
    },
    [onChange, typedValue]
  )

  const handleSendFilesToClient = useCallback(() => {
    // TODO: handle sending files to client here, based on checked values
  }, [])

  const columns = [
    columnHelper.accessor('shared_with_client', {
      header: () => <span>{t('label.shared_with_client')}</span>,
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
    columnHelper.accessor('name', {
      header: () => t('label.file_name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('feature', {
      header: () => t('label.task'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const selectedFeature = getValue()
        return t(`orders.features.${selectedFeature}`)
      },
    }),
    columnHelper.accessor('created_at', {
      header: () => t('label.added_at'),
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
        return (
          <BaseButton
            className={classNames(classes.iconButton, classes.downloadButton)}
            href={fileUrl}
            target="_blank"
            download={file.name}
          >
            <DownloadFilled />
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
              onChange={onChange}
              allowMultiple
            />
          </div>
        }
      />
      <Button
        appearance={AppearanceTypes.Primary}
        className={classes.saveButton}
        onClick={handleSendFilesToClient}
      >
        {t('button.save_changes')}
      </Button>
      <span className={classes.saveHelper}>
        {t('helper.save_files_helper')}
      </span>
    </div>
  )
}

export default FinalFilesList
