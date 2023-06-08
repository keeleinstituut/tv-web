import { FC, useState } from 'react'
import Button, {
  ButtonProps,
  IconPositioningTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import DragAndDrop from 'components/organisms/DragAndDrop/DragAndDrop'
import { ReactComponent as Attach } from 'assets/icons/attach.svg'

import classes from './styles.module.scss'
import { useTranslation } from 'react-i18next'

export enum InputFileTypes {
  Csv = '.csv',
}

export type FileImportProps = ButtonProps & {
  helperText?: string
  fileButtonText?: string
  inputFileType: InputFileTypes
  onDelete?: () => void
  error?: string
}

const FileImport: FC<FileImportProps> = ({
  helperText,
  onDelete,
  error,
  disabled,
  fileButtonText,
  inputFileType,
}) => {
  const { t } = useTranslation()
  const [isDragAndDropOpen, setDragAndDropOpen] = useState<boolean>(false)

  const handleDragAndDropClick = () => {
    setDragAndDropOpen(!isDragAndDropOpen)
  }

  return (
    <div className={classes.fileImportContainer}>
      <DragAndDrop
        onDelete={onDelete}
        error={error}
        inputFileType={inputFileType}
        isDragAndDropOpen={isDragAndDropOpen}
      />
      <Button
        onClick={handleDragAndDropClick}
        icon={Attach}
        size={SizeTypes.M}
        ariaLabel={t('label.attach_file')}
        iconPositioning={IconPositioningTypes.Right}
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
