import { FC, useCallback, RefObject, useRef, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { createPortal } from 'react-dom'
import { useInViewport } from 'ahooks'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { join, reduce } from 'lodash'
import {
  InputFileTypes,
  acceptFileExtensions,
} from 'components/organisms/FileImport/FileImport'
import classNames from 'classnames'
import { useClickAway } from 'ahooks'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import useElementPosition from 'hooks/useElementPosition'

interface DragAndDropContentProps {
  isDragAndDropOpen?: boolean
  setFiles?: (files: File[]) => void
  allowMultiple?: boolean
  inputFileTypes?: InputFileTypes[]
  parentRef: RefObject<HTMLDivElement>
  isFilesListHidden?: boolean
  setDragAndDropOpen?: (isOpen: boolean) => void
}

const DragAndDropContent: FC<DragAndDropContentProps> = ({
  inputFileTypes = [InputFileTypes.Csv],
  isDragAndDropOpen,
  setFiles,
  allowMultiple,
  parentRef,
  isFilesListHidden,
  setDragAndDropOpen,
}) => {
  const containerRef = useRef(null)
  const { left, top, right } =
    useElementPosition({
      ref: parentRef,
      forceRecalculate: isDragAndDropOpen,
    }) || {}

  const [inViewport, ratio] = useInViewport(containerRef)

  useClickAway(() => {
    if (setDragAndDropOpen) {
      setDragAndDropOpen(false)
    }
  }, [containerRef, parentRef])
  const useLeftPosition = useMemo(
    () => ratio && ratio < 1 && inViewport,
    // isDragAndDropOpen changes, when this component is displayed
    // We don't want to update this state during any other time
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inViewport]
  )

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
    accept: reduce(
      inputFileTypes,
      (result, value) => {
        if (!value) return result
        return {
          ...result,
          [value]: acceptFileExtensions[value],
        }
      },
      {}
    ),
  })

  const topPositionModifier = isFilesListHidden ? 157 : 141

  if (!isDragAndDropOpen) return null
  return (
    <div
      {...getRootProps()}
      className={classes.container}
      ref={containerRef}
      style={{
        left: useLeftPosition ? 'unset' : left,
        right: useLeftPosition ? (right || 0) - (left || 0) : 'unset',
        top: top ? top - topPositionModifier : 0,
      }}
    >
      <input
        type="file"
        accept={join(inputFileTypes, ',')}
        {...getInputProps()}
      />
      <div
        className={classNames(
          classes.dragAndDropContainer,
          useLeftPosition && classes.rightIndicator
        )}
      >
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
          {allowMultiple && t('file.pick_multiple_files')}
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
