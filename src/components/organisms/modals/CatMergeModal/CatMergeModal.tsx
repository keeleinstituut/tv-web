import { FC } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'

// TODO: this is WIP code for suborder view

export interface CatMergeModalProps
  extends Omit<ConfirmationModalBaseProps, 'handleProceed'> {
  handleMerge?: () => void
}

const CatMergeModal: FC<CatMergeModalProps> = ({
  modalContent,
  handleMerge,
  ...rest
}) => {
  const { t } = useTranslation()
  return (
    <ConfirmationModalBase
      {...rest}
      handleProceed={handleMerge}
      title={t('modal.cat_merge_title')}
      modalContent={
        <p className={classes.content}>{t('modal.cat_merge_content')}</p>
      }
    />
  )
}

export default CatMergeModal
