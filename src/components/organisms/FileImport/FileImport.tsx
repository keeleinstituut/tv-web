import { FC, useState, useRef, useEffect, useCallback, Fragment } from 'react'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import DragAndDrop from 'components/molecules/DragAndDrop/DragAndDrop'
import { ReactComponent as Attach } from 'assets/icons/attach.svg'
import { filter, size, map } from 'lodash'
import classes from './classes.module.scss'
import classNames from 'classnames'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ReactComponent as File } from 'assets/icons/file.svg'
import { useTranslation } from 'react-i18next'
import BaseButton from 'components/atoms/BaseButton/BaseButton'

export enum InputFileTypes {
  Csv = 'text/csv',
}

interface SharedImportProps {
  helperText?: string
  disabled?: boolean
  fileButtonText?: string
  fileButtonChangeText?: string
  inputFileType?: InputFileTypes
  onDelete?: (file: File) => void
  error?: string
}

type SingleSelectProps = {
  allowMultiple: false | undefined
  onChange?: (file: File) => void
}

type MultiSelectProps = {
  allowMultiple: true
  onChange?: (files: File[]) => void
}

export type FileImportProps = SharedImportProps &
  (SingleSelectProps | MultiSelectProps)

export const acceptFileExtensions = {
  [InputFileTypes.Csv]: ['.csv'],
}

const FileImport: FC<FileImportProps> = ({
  helperText,
  disabled,
  fileButtonText,
  fileButtonChangeText,
  onChange,
  allowMultiple,
  onDelete,
  error,
  ...rest
}) => {
  const [files, setFiles] = useState<File[]>([])
  const parentRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const [isDragAndDropOpen, setDragAndDropOpen] = useState<boolean>(false)

  useEffect(() => {
    if (onChange) {
      if (allowMultiple) {
        onChange(files)
      } else {
        onChange(files[0])
      }
    }
    // Make sure we only trigger this, when files change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

  const handleDelete = useCallback(
    (index: number) => {
      setFiles(filter(files, (_, fileIndex) => index !== fileIndex))
      if (onDelete) {
        onDelete(files[index])
      }
    },
    [files, onDelete]
  )

  const formatFileSize = (sizeInBytes: number): string => {
    const kilobytes = sizeInBytes / 1024
    if (kilobytes < 1024) {
      return `${kilobytes.toFixed(2)} ${t('label.kilobytes')}`
    }

    const megabytes = kilobytes / 1024
    return `${megabytes.toFixed(2)} ${t('label.megabytes')}`
  }

  const toggleDragAndDrop = () => {
    setDragAndDropOpen(!isDragAndDropOpen)
  }

  const handleSetFiles = useCallback(
    (files: File[]) => {
      setFiles(files)
      setDragAndDropOpen(!isDragAndDropOpen)
    },
    [isDragAndDropOpen]
  )

  return (
    <div className={classes.fileImportContainer} ref={parentRef}>
      <DragAndDrop
        parentRef={parentRef}
        isDragAndDropOpen={isDragAndDropOpen}
        setFiles={handleSetFiles}
        allowMultiple={allowMultiple}
        {...rest}
      />
      <Button
        onClick={toggleDragAndDrop}
        icon={!files?.length ? Attach : undefined}
        size={SizeTypes.M}
        ariaLabel={t('label.attach_file')}
        iconPositioning={IconPositioningTypes.Right}
        appearance={
          !files?.length ? AppearanceTypes.Primary : AppearanceTypes.Secondary
        }
        disabled={disabled}
        className={classes.fileButton}
      >
        {!files?.length ? fileButtonText : fileButtonChangeText}
      </Button>
      <p hidden={!helperText} className={classes.helperText}>
        {helperText}
      </p>
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
    </div>
  )
}

export default FileImport
