import { FC, useState } from 'react'
import Button, { ButtonProps } from 'components/molecules/Button/Button'
import DragAndDrop from 'components/organisms/DragAndDrop/DragAndDrop'

import classes from './styles.module.scss'

export enum InputFileTypes {
  Csv = '.csv',
}

export type FileImportProps = ButtonProps & {
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
    setDragAndDropOpen(!isDragAndDropOpen)
  }

  return (
    <div className={classes.fileImportContainer}>
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
        isDragAndDropOpen={isDragAndDropOpen}
      />
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
