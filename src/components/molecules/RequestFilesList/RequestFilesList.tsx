import { FC, Fragment } from 'react'
import dayjs from 'dayjs'
import { map } from 'lodash'
import { useTranslation } from 'react-i18next'
import DownloadFilled from 'assets/icons/download_filled.svg?react'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { SourceFile } from 'types/projects'
import classes from './classes.module.scss'

interface RequestFilesListProps {
  files: SourceFile[]
  title: string
}

const RequestFilesList: FC<RequestFilesListProps> = ({ files, title }) => {
  const { t } = useTranslation()

  if (!files.length) return null

  return (
    <div className={classes.container}>
      <h3>{title}</h3>
      {map(files, (file) => (
        <Fragment key={file.id}>
          <label className={classes.fileName}>{file.name}</label>
          <span>{dayjs(file.updated_at).format('DD.MM.YYYY HH:mm')}</span>
          <a href={file.original_url} download={file.file_name}>
            <BaseButton className={classes.button} aria-label={t('button.download')}>
              <DownloadFilled />
            </BaseButton>
          </a>
        </Fragment>
      ))}
    </div>
  )
}

export default RequestFilesList
