import {
  Dispatch,
  FC,
  Fragment,
  SetStateAction,
  useCallback,
  useState,
} from 'react'
import { useDropzone } from 'react-dropzone'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ReactComponent as File } from 'assets/icons/file.svg'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { map } from 'lodash'
import classNames from 'classnames'
import { FileImportProps } from 'components/organisms/FileImport/FileImport'

import classes from './styles.module.scss'

type FileProps = Omit<FileImportProps, 'helperText' | 'fileButtonText'> & {
  isDragAndDropOpen?: boolean
  setFileContent?: Dispatch<SetStateAction<string>>
  setFiles?: Dispatch<SetStateAction<File[]>>
}

const DragAndDropContent: FC<FileProps> = ({
  name,
  inputFileType,
  dropFilesText,
  dragFilesText,
  dropFilesButtonText,
  multipleFilesText,
  dropButtonText,
  isDragAndDropOpen,
  setFileContent,
  setFiles,
}) => {
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
  )
}

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
  isDragAndDropOpen,
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [fileContent, setFileContent] = useState<string>('')

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
      <DragAndDropContent
        inputFileType={inputFileType}
        name={name}
        dropFilesText={dropFilesText}
        dragFilesText={dragFilesText}
        dropFilesButtonText={dropFilesButtonText}
        multipleFilesText={multipleFilesText}
        dropButtonText={dropButtonText}
        isDragAndDropOpen={isDragAndDropOpen}
        setFileContent={setFileContent}
        setFiles={setFiles}
      />
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

export default DragAndDrop
