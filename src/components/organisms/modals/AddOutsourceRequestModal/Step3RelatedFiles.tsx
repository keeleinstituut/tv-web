import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import { reduce } from 'lodash'
import classNames from 'classnames'

import ToggleInput from 'components/molecules/ToggleInput/ToggleInput'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import Delete from 'assets/icons/delete.svg?react'
import FileIcon from 'assets/icons/file.svg?react'
import {
  ProjectFileTypes,
  acceptFileExtensions,
} from 'components/organisms/FileImport/FileImport'

import classes from './classes.module.scss'
import { AddOutsourceRequestDraft } from './types'

interface Step3Props {
  draft: AddOutsourceRequestDraft
  files: File[]
  onChange: (patch: Partial<AddOutsourceRequestDraft>) => void
  onFilesChange: (files: File[]) => void
}

const formatFileSize = (sizeInBytes: number): string => {
  const kilobytes = sizeInBytes / 1024
  if (kilobytes < 1024) return `${kilobytes.toFixed(2)} KB`
  return `${(kilobytes / 1024).toFixed(2)} MB`
}

const Step3RelatedFiles: FC<Step3Props> = ({
  draft,
  files,
  onChange,
  onFilesChange,
}) => {
  const { t } = useTranslation()

  const onDrop = useCallback(
    (accepted: File[]) => {
      onFilesChange([...files, ...accepted])
    },
    [files, onFilesChange]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    accept: reduce(
      ProjectFileTypes,
      (result, value) => ({
        ...result,
        [value]: acceptFileExtensions[value],
      }),
      {}
    ),
  })

  const handleDelete = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className={classes.stepBody}>
      <div className={classes.formRow}>
        <span className={classes.rowLabel}>
          {t('requests.share_project_files')}
        </span>
        <div className={classes.rowContent}>
          <ToggleInput
            name="include_source_files"
            label=""
            value={draft.include_source_files}
            onChange={(next) => onChange({ include_source_files: next })}
            className={classes.modalToggle}
          />
        </div>
      </div>

      <div className={classes.formRow}>
        <span className={classes.rowLabel}>
          {t('requests.add_request_file')}
        </span>
        <div className={classes.rowContent}>
          <div
            {...getRootProps()}
            className={classNames(
              classes.dropzone,
              isDragActive && classes.dropzoneActive
            )}
          >
            <input {...getInputProps()} />
            <span className={classes.dropzoneText}>
              {t('requests.drop_file_here_or')}
            </span>
            <Button
              type="button"
              appearance={AppearanceTypes.Primary}
              size={SizeTypes.S}
              onClick={open}
            >
              {t('requests.choose_file')}
            </Button>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <ul className={classes.fileList}>
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className={classes.fileItem}>
              <FileIcon className={classes.fileIcon} />
              <div className={classes.fileMeta}>
                <p className={classes.fileName}>{file.name}</p>
                <p className={classes.fileSize}>{formatFileSize(file.size)}</p>
              </div>
              <BaseButton
                onClick={() => handleDelete(index)}
                aria-label={t('button.delete')}
                className={classes.fileDelete}
              >
                <Delete />
              </BaseButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Step3RelatedFiles
