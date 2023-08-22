import { FC } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { useTranslation } from 'react-i18next'

import classes from './classes.module.scss'

export type ConfirmSendToCatModalProps = ConfirmationModalBaseProps

const ConfirmSendToCatModal: FC<ConfirmSendToCatModalProps> = ({ ...rest }) => {
  const { t } = useTranslation()
  return (
    <ConfirmationModalBase
      title={t('modal.confirm_send_to_cat_title')}
      cancelButtonContent={t('button.quit')}
      proceedButtonContent={t('button.send')}
      {...rest}
      modalContent={
        <>
          <p className={classes.helpText}>
            {t('modal.confirm_send_to_cat_description')}
          </p>
          <br />
          <p className={classes.helpText}>{t('modal.confirm_source_files')}</p>
          <p className={classes.helpText}>
            {t('modal.confirm_translation_memories')}
          </p>
        </>
      }
    />
  )
}

export default ConfirmSendToCatModal
