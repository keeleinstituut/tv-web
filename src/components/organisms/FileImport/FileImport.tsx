import { FC, Fragment, useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ReactComponent as File } from 'assets/icons/file.svg'
import Button, {
  AppearanceTypes,
  SizeTypes,
  ButtonProps,
} from 'components/molecules/Button/Button'
import { map } from 'lodash'
import classNames from 'classnames'

import classes from './styles.module.scss'

export enum InputFileTypes {
  Csv = '.csv',
}

type FileImportProps = ButtonProps & {
  helperText?: string
  fileButtonText?: string
  inputFileType: InputFileTypes
  name?: string
  fileLabel?: string
  kilobytesLabel?: string
  megabytesLabel?: string
  onClick?: () => void
  error?: string
  dropFilesText?: string
  dragFilesText?: string
  dropFilesButtonText?: string
  multipleFilesText?: string
  dropButtonText?: string
}

type FileProps = Omit<FileImportProps, 'helperText' | 'fileButtonText'>

const DragAndDrop: FC<FileProps> = ({
  fileLabel,
  onClick,
  error,
  kilobytesLabel,
  megabytesLabel,
  name,
  inputFileType,
  dropFilesText,
  dragFilesText,
  dropFilesButtonText,
  multipleFilesText,
  dropButtonText,
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [fileContent, setFileContent] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onload = () => {
        const currentFile = reader.result as string
        setFileContent(currentFile)
      }
      reader.readAsText(file)
    })
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const formatFileSize = (sizeInBytes: number): string => {
    const kilobytes = sizeInBytes / 1024
    if (kilobytes < 1024) {
      return kilobytes.toFixed(2) + ` ${kilobytesLabel}`
    }

    const megabytes = kilobytes / 1024
    return megabytes.toFixed(2) + ` ${megabytesLabel}`
  }

  return (
    <>
      <div {...getRootProps()}>
        <input
          id={name}
          type="file"
          accept={inputFileType}
          {...getInputProps()}
        />
        <div className={classes.dragAndDropContainer}>
          <div className={classes.dragAndDropContent}>
            <p hidden={!isDragActive}>{dropFilesText}</p>
            <h3 hidden={isDragActive}>{dragFilesText}</h3>
            <p hidden={isDragActive} className={classes.dragAndDropText}>
              {dropFilesButtonText}
              <Button
                appearance={AppearanceTypes.Primary}
                size={SizeTypes.S}
                className={classes.dropButton}
              >
                {dropButtonText}
              </Button>
            </p>
          </div>
          <p hidden={isDragActive} className={classes.multipleFilesText}>
            {multipleFilesText}
          </p>
        </div>
      </div>
      <h5
        hidden={!files?.length}
        className={classNames(files?.length && classes.fileLabel)}
      >
        {fileLabel}
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
              <Delete onClick={onClick} />
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
      <div className={classes.fileContent}>{fileContent}</div>
    </>
  )
}

const FileImport: FC<FileImportProps> = ({
  helperText,
  fileLabel,
  onClick,
  error,
  kilobytesLabel,
  megabytesLabel,
  icon,
  appearance,
  size,
  ariaLabel,
  iconPositioning,
  disabled,
  fileButtonText,
  name,
  inputFileType,
  dropFilesText,
  dragFilesText,
  dropFilesButtonText,
  multipleFilesText,
  dropButtonText,
}) => {
  const [isDragAndDropOpen, setDragAndDropOpen] = useState<boolean>(false)

  const handleDragAndDropClick = () => {
    setDragAndDropOpen(true)
  }

  return (
    <div className={classes.fileImportContainer}>
      {isDragAndDropOpen && (
        <DragAndDrop
          fileLabel={fileLabel}
          onClick={onClick}
          error={error}
          kilobytesLabel={kilobytesLabel}
          megabytesLabel={megabytesLabel}
          name={name}
          inputFileType={inputFileType}
          dropFilesText={dropFilesText}
          dragFilesText={dragFilesText}
          dropFilesButtonText={dropFilesButtonText}
          multipleFilesText={multipleFilesText}
          dropButtonText={dropButtonText}
        />
      )}
      <Button
        onClick={handleDragAndDropClick}
        icon={icon}
        appearance={appearance}
        size={size}
        ariaLabel={ariaLabel}
        iconPositioning={iconPositioning}
        disabled={disabled}
        className={classes.fileButton}
      >
        {fileButtonText}
      </Button>
      <p hidden={!helperText} className={classes.helperText}>
        {helperText}
      </p>
    </div>
  )
}

export default FileImport
