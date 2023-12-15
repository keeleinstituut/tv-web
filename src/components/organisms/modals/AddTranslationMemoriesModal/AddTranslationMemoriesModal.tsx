import { AppearanceTypes } from 'components/molecules/Button/Button'
import ModalBase, {
  TitleFontTypes,
  ButtonPositionTypes,
  ModalSizeTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { t } from 'i18next'
import { join, map, pickBy, reduce, reverse, size, split } from 'lodash'
import { closeModal } from '../ModalRoot'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { ConfirmationModalBaseProps } from '../ConfirmationModalBase/ConfirmationModalBase'
import TranslationMemoriesTable from 'components/organisms/tables/TranslationMemoriesTable/TranslationMemoriesTable'
import classes from './classes.module.scss'
import { SubmitHandler, useForm } from 'react-hook-form'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import {
  useFetchSubProjectTmKeys,
  useUpdateSubProjectTmKeys,
} from 'hooks/requests/useTranslationMemories'
import { ClassifierValue } from 'types/classifierValues'

interface FormValues {
  [key: string]: boolean
}
type AddTranslationMemoriesType = {
  subProjectId?: string
  subProjectLangPair?: string
  projectDomain?: ClassifierValue
} & ConfirmationModalBaseProps

const AddTranslationMemoriesModal: FC<AddTranslationMemoriesType> = ({
  isModalOpen,
  subProjectId,
  subProjectLangPair = '',
  projectDomain,
}) => {
  const { updateSubProjectTmKeys } = useUpdateSubProjectTmKeys({ subProjectId })
  const { subProjectTmKeyObjectsArray } = useFetchSubProjectTmKeys({
    subProjectId,
  })

  const defaultFormValues = useMemo(
    () =>
      reduce(
        subProjectTmKeyObjectsArray,
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
    [subProjectTmKeyObjectsArray]
  )

  const {
    control,
    watch,
    reset,
    formState: { isSubmitting },
    handleSubmit,
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
    reset(defaultFormValues)
  }, [defaultFormValues, reset])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const checkedValues = pickBy(values, (val) => !!val)

      const payload = {
        tm_keys: map(checkedValues, (_, key) => {
          return {
            key: key || '',
          }
        }),
      }

      try {
        await updateSubProjectTmKeys(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.translation_memories_created'),
        })
        closeModal()
      } catch (errorData) {
        // error message comes from api errorHandles
      }
    },
    [updateSubProjectTmKeys]
  )

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
          onClick: handleSubmit(onSubmit),
          type: 'submit',
          disabled: isButtonDisabled,
        },
      ]}
    >
      <TranslationMemoriesTable
        isSelectingModal={true}
        tmKeyControl={control}
        initialFilters={{
          lang_pair: [
            subProjectLangPair,
            join(reverse(split(subProjectLangPair, '_')), '_'),
          ],
          tv_domain: [projectDomain?.id || ''],
        }}
      />
    </ModalBase>
  )
}

export default AddTranslationMemoriesModal
