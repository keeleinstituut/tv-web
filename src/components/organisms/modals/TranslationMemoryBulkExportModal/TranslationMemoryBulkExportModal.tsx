import { FC, useMemo } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { useTranslation } from 'react-i18next'

import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { TMType, TranslationMemoryType } from 'types/translationMemories'
import { chain, isEmpty, map } from 'lodash'

import classes from './classes.module.scss'
import { useExportTMX } from 'hooks/requests/useTranslationMemories'

export interface TranslationMemoryBulkExportModalProps
  extends ConfirmationModalBaseProps {
  translationMemories: TranslationMemoryType[]
  source_language: string
  target_language: string
}

const TranslationMemoryBulkExportModal: FC<
  TranslationMemoryBulkExportModalProps
> = ({
  closeModal,
  translationMemories: translationMemoriesBase,
  source_language,
  target_language,
  ...rest
}) => {
  const { t } = useTranslation()

  const translationMemories = useMemo(() => {
    return chain(translationMemoriesBase).sortBy(['type', 'name']).value()
  }, [translationMemoriesBase])

  const { exportTMX, isLoading } = useExportTMX()

  const handleExport = async () => {
    const payload = {
      tag: map(translationMemories, 'id'),
      slang: source_language,
      tlang: target_language,
    }

    try {
      await exportTMX(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.translation_memory_export'),
      })
      closeModal()
    } catch (error) {
      showNotification({
        type: NotificationTypes.Error,
        title: t('notification.error'),
        content: t('notification.tm_export_failed'),
      })
    }
  }

  return (
    <ConfirmationModalBase
      title={t('translation_memories.export_confirmation_text')}
      modalContent={
        isEmpty(translationMemories) ? (
          <></>
        ) : (
          <>
            <div className={classes.helpText}>
              {t('translation_memories.export_confirmation_help_text')}
            </div>
            <ul className={classes.memoriesList}>
              {map(translationMemories, (m) => {
                const translatedType = t(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  `translation_memories.status.${m.type}` as any
                )
                return (
                  <li
                    key={m.id}
                    className={
                      m.type !== TMType.Public ? classes.notPublicMemory : ''
                    }
                  >
                    {translatedType} - {m.name}
                  </li>
                )
              })}
            </ul>
          </>
        )
      }
      cancelButtonContent={t('button.quit')}
      proceedButtonContent={t('button.confirm')}
      closeModal={closeModal}
      handleProceed={handleExport}
      proceedButtonLoading={isLoading}
      {...rest}
    />
  )
}

export default TranslationMemoryBulkExportModal
