import { FC, useCallback, useState } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { map, range, toString } from 'lodash'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import SelectionControlsInput, {
  DropdownSizeTypes,
} from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { Root } from '@radix-ui/react-form'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useSplitCatJobs } from 'hooks/requests/useOrders'

export interface CatSplitModalProps
  extends Omit<ConfirmationModalBaseProps, 'handleProceed'> {
  subOrderId?: string
}

const CatSplitModal: FC<CatSplitModalProps> = ({
  modalContent,
  subOrderId,
  closeModal,
  ...rest
}) => {
  const { t } = useTranslation()
  const [splitsAmount, setSplitsAmount] = useState(2)
  const { splitCatJobs } = useSplitCatJobs()

  const handleSplit = useCallback(async () => {
    const payload = {
      sub_project_id: subOrderId || '',
      chunks_count: splitsAmount,
    }
    try {
      await splitCatJobs(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.file_split_success'),
      })
      setSplitsAmount(2)
      closeModal()
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [closeModal, splitCatJobs, splitsAmount, subOrderId, t])

  return (
    <ConfirmationModalBase
      {...rest}
      handleProceed={handleSplit}
      cancelButtonContent={t('button.quit')}
      proceedButtonContent={t('button.confirm')}
      title={t('modal.cat_split_title')}
      closeModal={closeModal}
      modalContent={
        <Root>
          <p className={classes.firstSection}>
            {t('modal.cat_split_content_first_section')}
          </p>
          <p className={classes.secondSection}>
            {t('modal.cat_split_content_italic_section')}
          </p>
          <SelectionControlsInput
            className={classes.numberSelector}
            name="cat_split_amount"
            ariaLabel={t('label.cat_split_amount')}
            options={map(range(2, 101), (number) => ({
              value: toString(number),
              label: toString(number),
            }))}
            value={toString(splitsAmount)}
            onChange={(value) => {
              setSplitsAmount(Number(value))
            }}
            hideTags
            usePortal
            dropdownSize={DropdownSizeTypes.S}
          />
        </Root>
      }
    />
  )
}

export default CatSplitModal
