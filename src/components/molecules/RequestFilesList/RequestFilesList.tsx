import { FC, Fragment } from 'react'
import dayjs from 'dayjs'
import { map } from 'lodash'
import { useTranslation } from 'react-i18next'
import DownloadFilled from 'assets/icons/download_filled.svg?react'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { CollectionType, useDownloadFile } from 'hooks/requests/useFiles'
import { SourceFile } from 'types/projects'
import classes from './classes.module.scss'

interface RequestFilesListProps {
  files: SourceFile[]
  title: string
  requestId: string
}

const RequestFilesList: FC<RequestFilesListProps> = ({
  files,
  title,
  requestId,
}) => {
  const { t } = useTranslation()
  const { downloadFile } = useDownloadFile({
    reference_object_id: requestId,
    reference_object_type: 'outsource_request',
    collection: CollectionType.RequestFiles,
  })

  if (!files.length) return null

  return (
    <div className={classes.container}>
      <h3>{title}</h3>
      {map(files, (file) => (
        <Fragment key={file.id}>
          <label className={classes.fileName}>{file.name}</label>
          <span>{dayjs(file.updated_at).format('DD.MM.YYYY HH:mm')}</span>
          <BaseButton
            className={classes.button}
            aria-label={t('button.download')}
            onClick={() => downloadFile(file)}
          >
            <DownloadFilled />
          </BaseButton>
        </Fragment>
      ))}
    </div>
  )
}

export default RequestFilesList
