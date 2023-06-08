import { FC, Fragment, useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ReactComponent as File } from 'assets/icons/file.svg'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { map, filter, size } from 'lodash'
import classNames from 'classnames'
import { FileImportProps } from 'components/organisms/FileImport/FileImport'

import classes from './styles.module.scss'
import { useTranslation } from 'react-i18next'
import BaseButton from 'components/atoms/BaseButton/BaseButton'

type FileProps = Omit<FileImportProps, 'helperText' | 'fileButtonText'> & {
  isDragAndDropOpen?: boolean
  setFileContent?: (string: string) => void
  setFiles?: (files: File[]) => void
}

const DragAndDropContent: FC<FileProps> = ({
  inputFileType,
  isDragAndDropOpen,
  setFileContent,
  setFiles,
}) => {
  const { t } = useTranslation()
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader()

        reader.onload = () => {
          const currentFile = reader.result as string
          if (setFileContent) {
            setFileContent(currentFile)
          }
        }
        reader.readAsText(file)
      })
      if (setFiles) {
        setFiles(acceptedFiles)
      }
    },
    [setFileContent, setFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  if (!isDragAndDropOpen) return null
  return (
    <div {...getRootProps()} className={classes.container}>
      <input type="file" accept={inputFileType} {...getInputProps()} />
      <div className={classes.dragAndDropContainer}>
        <div className={classes.dragAndDropContent}>
          <h3> {isDragActive ? t('file.drop_files') : t('file.drag_drop')}</h3>
          <p hidden={isDragActive} className={classes.dragAndDropText}>
            {t('file.file_here_or')}
            <Button
              appearance={AppearanceTypes.Primary}
              size={SizeTypes.S}
              className={classes.dropButton}
            >
              {t('button.choose')}
            </Button>
          </p>
        </div>
        <p className={classes.multipleFilesText}>
          {t('file.pick_multiple_files')}
        </p>
      </div>
    </div>
  )
}

const DragAndDrop: FC<FileProps> = ({
  onDelete,
  error,
  name,
  inputFileType,
  isDragAndDropOpen,
  setFileContent,
}) => {
  const { t } = useTranslation()
  const [files, setFiles] = useState<File[]>([])

  const formatFileSize = (sizeInBytes: number): string => {
    const kilobytes = sizeInBytes / 1024
    if (kilobytes < 1024) {
      return kilobytes.toFixed(2) + ` ${t('label.kilobytes')}`
    }

    const megabytes = kilobytes / 1024
    return megabytes.toFixed(2) + ` ${t('label.megabytes')}`
  }

  const handleDelete = useCallback(
    (index: number) => {
      setFiles(filter(files, (_, fileIndex) => index !== fileIndex))
      if (onDelete) {
        onDelete()
      }
    },
    [files, onDelete]
  )

  return (
    <>
      <DragAndDropContent
        inputFileType={inputFileType}
        name={name}
        isDragAndDropOpen={isDragAndDropOpen}
        setFileContent={setFileContent}
        setFiles={setFiles}
      />
      <h5
        hidden={!files?.length}
        className={classNames(files?.length && classes.fileLabel)}
      >
        {size(files) > 1 ? t('label.added_files') : t('label.added_file')}
      </h5>
      <ul
        className={classNames(
          files?.length && classes.fileContainer,
          files?.length && error && classes.errorContainer
        )}
      >
        {map(files, (file, index) => {
          return (
            <Fragment key={index}>
              <File className={classes.icon} />
              <div className={classes.fileDetailsContainer}>
                <p className={classes.fileName}>{file?.name}</p>
                <p className={classes.fileSize}>{formatFileSize(file?.size)}</p>
              </div>
              <BaseButton onClick={() => handleDelete(index)}>
                <Delete />
              </BaseButton>
            </Fragment>
          )
        })}
      </ul>
      <p
        hidden={!error || !files?.length}
        className={classNames(files?.length && classes.errorText)}
      >
        {error}
      </p>
    </>
  )
}

export default DragAndDrop
