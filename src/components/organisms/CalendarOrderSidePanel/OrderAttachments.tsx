import { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import AddIcon from 'assets/icons/add.svg?react'
import DownloadIcon from 'assets/icons/download.svg?react'
import DeleteIcon from 'assets/icons/delete.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import { useSidePanel } from './SidePanelContext'
import classes from './classes.module.scss'

const OrderAttachments: FC = () => {
  const { t } = useTranslation()
  const {
    isEditing,
    isPastSlot,
    isTPM,
    isCancelled,
    order,
    addFiles,
    downloadFile,
    deleteFile,
    isAddingFiles,
    isDeletingFile,
  } = useSidePanel()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFilesOpen, setIsFilesOpen] = useState(false)

  return (
    <>
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <span className={classes.sectionLabel}>
          {t('calendar.attachments')}
        </span>
        {!!order?.source_files?.length && (
          <button
            className={classes.sectionBtn}
            onClick={() => setIsFilesOpen((v) => !v)}
          >
            <span className={classes.sectionNote}>
              {order.source_files.length}
            </span>
            <ChevronLeft
              className={classNames(classes.sectionChevron, {
                [classes.sectionChevronOpen]: isFilesOpen,
              })}
            />
          </button>
        )}
        {isEditing && !isPastSlot && !(isTPM && isCancelled) && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                if (files.length) addFiles(files)
                e.target.value = ''
              }}
            />
            <button
              className={classes.sectionBtn}
              disabled={isAddingFiles}
              onClick={() => fileInputRef.current?.click()}
            >
              {t('calendar.add_short')}
              <AddIcon style={{ width: 16, height: 16 }} />
            </button>
          </>
        )}
      </div>
      {isFilesOpen && !!order?.source_files?.length && (
        <div className={classes.fileList}>
          {order.source_files.map((f) => (
            <div key={f.id} className={classes.fileItem}>
              <button
                className={classes.fileLink}
                onClick={() =>
                  downloadFile({
                    id: f.id,
                    file_name: f.file_name,
                    collection: f.collection_name ?? 'help',
                  })
                }
              >
                {f.name}
              </button>
              <DownloadIcon
                className={classes.downloadIcon}
                onClick={() =>
                  downloadFile({
                    id: f.id,
                    file_name: f.file_name,
                    collection: f.collection_name ?? 'help',
                  })
                }
                style={{ cursor: 'pointer' }}
              />
              {isEditing && (
                <button
                  className={classes.fileIconBtn}
                  disabled={isDeletingFile}
                  onClick={() =>
                    deleteFile({
                      id: f.id,
                      collection: f.collection_name ?? 'help',
                    })
                  }
                >
                  <DeleteIcon style={{ width: 24, height: 24 }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default OrderAttachments
