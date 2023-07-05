import { FC, useCallback, RefObject } from 'react'
import { useDropzone } from 'react-dropzone'
import { createPortal } from 'react-dom'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import {
  InputFileTypes,
  acceptFileExtensions,
} from 'components/organisms/FileImport/FileImport'

import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'

interface DragAndDropContentProps {
  isDragAndDropOpen?: boolean
  setFiles?: (files: File[]) => void
  allowMultiple?: boolean
  inputFileType?: InputFileTypes
  parentRef: RefObject<HTMLDivElement>
}

const DragAndDropContent: FC<DragAndDropContentProps> = ({
  inputFileType = InputFileTypes.Csv,
  isDragAndDropOpen,
  setFiles,
  allowMultiple,
  parentRef,
}) => {
  const { left, top } = parentRef?.current?.getBoundingClientRect() || {}
  const { t } = useTranslation()
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (setFiles) {
        setFiles(acceptedFiles)
      }
    },
    [setFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: !!allowMultiple,
    accept: {
      [inputFileType]: acceptFileExtensions[inputFileType],
    },
  })

  if (!isDragAndDropOpen) return null
  return (
    <div
      {...getRootProps()}
      className={classes.container}
      style={{ left, top: top ? top - 141 : 0 }}
    >
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

const DragAndDrop: FC<DragAndDropContentProps> = (props) => {
  return createPortal(
    <DragAndDropContent {...props} />,
    document.getElementById('root') || document.body
  )
}

export default DragAndDrop
