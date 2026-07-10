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
import UploadedFilesList from 'components/molecules/UploadedFilesList/UploadedFilesList'
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

      <UploadedFilesList
        files={files}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default Step3RelatedFiles
