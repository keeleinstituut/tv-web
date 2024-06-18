import { FC, useState, useRef, useEffect, useCallback, MouseEvent } from 'react'
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
  Pdf = 'application/pdf', // in list
  Doc = 'application/msword', // in list
  Docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // in list
  OpenDocument = 'application/vnd.oasis.opendocument.text',
  Excel = 'application/vnd.ms-excel',
  SpreadSheet = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  Outlook = 'application/vnd.ms-outlook',
  AsiceBdoc = 'application/vnd.etsi.asic-e+zip',
  Zip = 'application/zip',
  Zip7 = 'application/x-7z-compressed',
  Png = 'image/png',
  Rtf = 'application/rtf',
  Eml = 'message/rfc822',
  Ods = 'application/vnd.oasis.opendocument.spreadsheet',
  Jpeg = 'image/jpeg',
  Text = 'text/plain',
  Html = 'text/html',
  Xml = 'application/xml',
  TextXml = 'text/xml',
  Other = 'application/octet-stream',
  Mpeg = 'video/mp4',
  Mpeg3 = 'audio/mpeg',
  Avi = 'video/x-msvideo',
  QuickTime = 'video/quicktime',
  Wav = 'audio/wav',
  Aac = 'audio/aac',
  Wma = 'audio/x-ms-wma',
  Wmv = 'video/x-ms-asf',
  Ppt = 'application/vnd.ms-powerpoint',
  Pptx = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}

export const ProjectFileTypes = [
  InputFileTypes.Pdf,
  InputFileTypes.Doc,
  InputFileTypes.Docx,
  InputFileTypes.OpenDocument,
  InputFileTypes.Excel,
  InputFileTypes.SpreadSheet,
  InputFileTypes.Csv,
  InputFileTypes.Outlook,
  InputFileTypes.AsiceBdoc,
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
  InputFileTypes.Mpeg,
  InputFileTypes.Mpeg3,
  InputFileTypes.Avi,
  InputFileTypes.Wav,
  InputFileTypes.QuickTime,
  InputFileTypes.Aac,
  InputFileTypes.Wma,
  InputFileTypes.Wmv,
  InputFileTypes.Ppt,
  InputFileTypes.Pptx,
  // InputFileTypes.Other,
]

export const acceptFileExtensions = {
  [InputFileTypes.Csv]: ['.csv'],
  [InputFileTypes.Pdf]: ['.pdf'],
  [InputFileTypes.Doc]: ['.doc', '.docx'],
  [InputFileTypes.Docx]: ['.doc', '.docx'],
  [InputFileTypes.OpenDocument]: ['.odt'],
  [InputFileTypes.Excel]: ['.xls', '.xlsx'],
  [InputFileTypes.SpreadSheet]: ['.xls', '.xlsx'],
  [InputFileTypes.Outlook]: ['.msg'],
  [InputFileTypes.AsiceBdoc]: ['.asice', '.bdoc'],
  [InputFileTypes.Zip]: ['.zip'],
  [InputFileTypes.Zip7]: ['.7z'],
  [InputFileTypes.Png]: ['.png'],
  [InputFileTypes.Rtf]: ['.rtf'],
  [InputFileTypes.Eml]: ['.eml'],
  [InputFileTypes.Ods]: ['.ods'],
  [InputFileTypes.Jpeg]: ['.jpg', '.jpeg'],
  [InputFileTypes.Text]: ['.txt'],
  [InputFileTypes.Html]: ['.html', '.htm'],
  [InputFileTypes.Xml]: ['.xml', '.tmx'],
  [InputFileTypes.TextXml]: ['.xml'],
  [InputFileTypes.Other]: ['.akt', '.xst'],
  [InputFileTypes.Mpeg]: ['.mp4', '.hevc'],
  [InputFileTypes.Mpeg3]: ['.mp3'],
  [InputFileTypes.Avi]: ['.avi'],
  [InputFileTypes.QuickTime]: ['.mov'],
  [InputFileTypes.Wav]: ['.wav'],
  [InputFileTypes.Aac]: ['.aac'],
  [InputFileTypes.Wma]: ['.wma'],
  [InputFileTypes.Wmv]: ['.wmv'],
  [InputFileTypes.Ppt]: ['.ppt'],
  [InputFileTypes.Pptx]: ['.pptx'],
}

interface AddedFilesListProps {
  hidden?: boolean
  files: File[]
  handleDelete: (index: number) => void
  error?: string
  listContainerClassName?: string
}

// TODO: might use a different custom component instead of this
const AddedFilesList: FC<AddedFilesListProps> = ({
  hidden,
  files,
  handleDelete,
  error,
  listContainerClassName,
}) => {
  const { t } = useTranslation()
  const formatFileSize = (sizeInBytes: number): string => {
    const kilobytes = sizeInBytes / 1024
    if (kilobytes < 1024) {
      return `${kilobytes.toFixed(2)} ${t('label.kilobytes')}`
    }

    const megabytes = kilobytes / 1024
    return `${megabytes.toFixed(2)} ${t('label.megabytes')}`
  }

  if (hidden) return null
  return (
    <>
      <h5
        hidden={!files?.length}
        className={classNames(files?.length && classes.fileLabel)}
      >
        {size(files) > 1 ? t('label.added_files') : t('label.added_file')}
      </h5>
      <ul
        className={classNames(
          files?.length && classes.fileContainer,
          files?.length && error && classes.errorContainer,
          listContainerClassName
        )}
      >
        {map(files, (file, index) => {
          return (
            <li key={index}>
              <File className={classes.icon} />
              <div className={classes.fileDetailsContainer}>
                <p className={classes.fileName}>{file?.name}</p>
                <p className={classes.fileSize}>{formatFileSize(file?.size)}</p>
              </div>
              <BaseButton
                onClick={() => handleDelete(index)}
                className={classes.button}
                aria-label={t('button.delete')}
              >
                <Delete />
              </BaseButton>
            </li>
          )
        })}
      </ul>
    </>
  )
}

interface SharedImportProps {
  helperText?: string
  disabled?: boolean
  fileButtonText?: string
  fileButtonChangeText?: string
  inputFileTypes?: InputFileTypes[]
  onDelete?: (file: File) => void
  error?: string
  isFilesListHidden?: boolean
  className?: string
  files?: File[]
  hidden?: boolean
  size?: SizeTypes
  listContainerClassName?: string
  storeLocally?: boolean
}

type SingleSelectProps = {
  allowMultiple: false | undefined
  onChange?: (file: File, isDelete?: boolean) => void
}

type MultiSelectProps = {
  allowMultiple: true
  onChange?: (files: File[], isDelete?: boolean) => void
}

export type FileImportProps = SharedImportProps &
  (SingleSelectProps | MultiSelectProps)

const FileImport: FC<FileImportProps> = ({
  helperText,
  disabled,
  fileButtonText,
  fileButtonChangeText,
  onChange,
  allowMultiple,
  onDelete,
  error,
  isFilesListHidden,
  className,
  files,
  hidden,
  size,
  listContainerClassName,
  storeLocally,
  ...rest
}) => {
  const [localFiles, setFiles] = useState<File[]>(files || [])
  const parentRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const [isDragAndDropOpen, setDragAndDropOpen] = useState<boolean>(false)
  const [focusElement, setFocusElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Sync files from outside to local state
    if (files) {
      setFiles(files)
    }
  }, [files])

  const onChangeHandler = useCallback(
    (newFiles: File[], isDelete?: boolean) => {
      if (onChange) {
        if (allowMultiple) {
          onChange(newFiles, isDelete)
        } else {
          onChange(newFiles[0], isDelete)
        }
      }
    },
    [allowMultiple, onChange]
  )

  const handleDelete = useCallback(
    (index: number) => {
      const newFiles = filter(localFiles, (_, fileIndex) => index !== fileIndex)
      setFiles(newFiles)
      onChangeHandler(newFiles, true)
      if (onDelete) {
        onDelete(localFiles[index])
      }
    },
    [localFiles, onChangeHandler, onDelete]
  )

  const toggleDragAndDrop = (event: MouseEvent | KeyboardEvent) => {
    setDragAndDropOpen(!isDragAndDropOpen)
    if (!document.querySelector('.dragNDrop-focus') && !isDragAndDropOpen) {
      const target = event?.target as HTMLElement
      target.classList.add('dragNDrop-focus')
      setFocusElement(target)
    }
  }
  const escFunction = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setDragAndDropOpen(false)
    }
  }, [])

  useEffect(() => {
    if (document.querySelector('.dragNDrop-focus') && !isDragAndDropOpen) {
      focusElement?.classList.remove('dragNDrop-focus')
      focusElement?.focus()
    }
  }, [focusElement, isDragAndDropOpen])

  useEffect(() => {
    document.addEventListener('keydown', escFunction)
    return () => {
      document.removeEventListener('keydown', escFunction)
    }
  }, [escFunction])

  const handleSetFiles = useCallback(
    (newFiles: File[]) => {
      const filesToSave = isFilesListHidden
        ? [...localFiles, ...newFiles]
        : newFiles
      onChangeHandler(filesToSave)
      if (storeLocally) {
        setFiles(filesToSave)
      }
      setDragAndDropOpen(!isDragAndDropOpen)
    },
    [
      isDragAndDropOpen,
      isFilesListHidden,
      localFiles,
      onChangeHandler,
      storeLocally,
    ]
  )

  if (hidden) return null

  return (
    <div
      className={classNames(classes.fileImportContainer, className)}
      ref={parentRef}
    >
      <DragAndDrop
        parentRef={parentRef}
        isDragAndDropOpen={isDragAndDropOpen}
        setDragAndDropOpen={setDragAndDropOpen}
        setFiles={handleSetFiles}
        allowMultiple={allowMultiple}
        {...rest}
      />
      <Button
        onClick={toggleDragAndDrop}
        icon={!localFiles?.length || isFilesListHidden ? Attach : undefined}
        size={size || SizeTypes.M}
        ariaLabel={t('label.attach_file')}
        iconPositioning={IconPositioningTypes.Right}
        appearance={
          !localFiles?.length || isFilesListHidden
            ? AppearanceTypes.Primary
            : AppearanceTypes.Secondary
        }
        disabled={disabled}
        className={classes.fileButton}
      >
        {!localFiles?.length || isFilesListHidden
          ? fileButtonText
          : fileButtonChangeText}
      </Button>
      <p hidden={!helperText} className={classes.helperText}>
        {helperText}
      </p>
      <AddedFilesList
        handleDelete={handleDelete}
        files={localFiles}
        hidden={isFilesListHidden}
        listContainerClassName={listContainerClassName}
      />
      <p
        hidden={!error || !localFiles?.length}
        className={classNames(localFiles?.length && classes.errorText)}
      >
        {error}
      </p>
    </div>
  )
}

export default FileImport
