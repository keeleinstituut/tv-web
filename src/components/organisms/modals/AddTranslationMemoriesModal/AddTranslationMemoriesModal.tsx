import { AppearanceTypes } from 'components/molecules/Button/Button'
import ModalBase, {
  TitleFontTypes,
  ButtonPositionTypes,
  ModalSizeTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { t } from 'i18next'
import { map, pickBy, reduce, size } from 'lodash'
import { closeModal } from '../ModalRoot'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { ConfirmationModalBaseProps } from '../ConfirmationModalBase/ConfirmationModalBase'
import TranslationMemoriesTable from 'components/organisms/tables/TranslationMemoriesTable/TranslationMemoriesTable'
import classes from './classes.module.scss'
import { useForm } from 'react-hook-form'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import {
  useFetchSubOrderTmKeys,
  useUpdateSubOrderTmKeys,
} from 'hooks/requests/useTranslationMemories'
import { showValidationErrorMessage } from 'api/errorHandler'

interface FormValues {
  [key: string]: boolean
}
type AddTranslationMemoriesType = {
  subOrderId?: string
} & ConfirmationModalBaseProps

const AddTranslationMemoriesModal: FC<AddTranslationMemoriesType> = ({
  isModalOpen,
  subOrderId,
}) => {
  const { updateSubOrderTmKeys } = useUpdateSubOrderTmKeys()
  const { subOrderTmKeys } = useFetchSubOrderTmKeys({ id: subOrderId })

  const defaultFormValues = useMemo(
    () =>
      reduce(
        subOrderTmKeys,
        (result, value) => {
          if (!value.key) {
            return result
          }
          return {
            ...result,
            [value.key]: true,
          }
        },
        {}
      ),
    [subOrderTmKeys]
  )

  const {
    control,
    watch,
    getValues,
    reset,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    mode: 'onChange',
    resetOptions: {
      keepErrors: true,
    },
    defaultValues: defaultFormValues,
  })

  const isButtonDisabled = size(pickBy(watch(), (val) => !!val)) > 9

  useEffect(() => {
    if (isButtonDisabled) {
      showNotification({
        type: NotificationTypes.Error,
        title: t('notification.announcement'),
        content: t('translation_memory.selecting_tm_amount'),
      })
    }
  }, [isButtonDisabled])

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset()
    }
  }, [isSubmitSuccessful, reset])

  const handleUpdateTmKeys = useCallback(async () => {
    const values = pickBy(getValues(), (val) => !!val)

    const payload = {
      sub_project_id: subOrderId || '',
      tm_keys: map(values, (_, key) => {
        return {
          key: key,
          is_writable: true,
        }
      }),
    }

    try {
      await updateSubOrderTmKeys(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.translation_memories_created'),
      })
      closeModal()
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [getValues, subOrderId, updateSubOrderTmKeys])

  return (
    <ModalBase
      title={t('translation_memory.selecting_tm')}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      helperText={t('translation_memory.selecting_tm_amount')}
      innerWrapperClassName={classes.modalContent}
      buttonsPosition={ButtonPositionTypes.Right}
      size={ModalSizeTypes.ExtraLarge}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          onClick: () => {
            reset()
            closeModal()
          },
          children: t('button.quit'),
        },
        {
          appearance: AppearanceTypes.Primary,
          form: 'tm_select',
          children: t('button.add'),
          loading: isSubmitting,
          onClick: handleUpdateTmKeys,
          type: 'submit',
          disabled: isButtonDisabled,
        },
      ]}
    >
      <TranslationMemoriesTable
        isSelectingModal={true}
        tmKeyControl={control}
      />
    </ModalBase>
  )
}

export default AddTranslationMemoriesModal
