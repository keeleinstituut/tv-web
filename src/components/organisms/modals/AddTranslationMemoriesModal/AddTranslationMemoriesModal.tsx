import { AppearanceTypes } from 'components/molecules/Button/Button'
import ModalBase, {
  TitleFontTypes,
  ButtonPositionTypes,
  ModalSizeTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { t } from 'i18next'
import {
  join,
  keys,
  map,
  pickBy,
  reduce,
  reverse,
  size,
  split,
  union,
} from 'lodash'
import { closeModal } from '../ModalRoot'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { ConfirmationModalBaseProps } from '../ConfirmationModalBase/ConfirmationModalBase'
import TranslationMemoriesTable from 'components/organisms/tables/TranslationMemoriesTable/TranslationMemoriesTable'
import classes from './classes.module.scss'
import { SubmitHandler, useForm } from 'react-hook-form'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import {
  useCatProject,
  useUpdateCatProjectTranslationMemories,
} from 'components/organisms/features/CatToolFeature/useCatTranslationMemories'
import { ClassifierValue } from 'types/classifierValues'

interface FormValues {
  [key: string]: boolean
}
type AddTranslationMemoriesType = {
  catProjectId: string
  subProjectLangPair?: string
  projectDomain?: ClassifierValue
} & ConfirmationModalBaseProps

const AddTranslationMemoriesModal: FC<AddTranslationMemoriesType> = ({
  isModalOpen,
  catProjectId,
  subProjectLangPair = '',
  projectDomain,
}) => {
  const catProjectQuery = useCatProject(catProjectId)
  const { mutateAsync: updateCatProjectTms } =
    useUpdateCatProjectTranslationMemories(catProjectId)

  const assignedList: { id: string; read: boolean; write: boolean }[] =
    catProjectQuery.data?.data?.translation_memories || []

  const assignedMap = useMemo(
    () => new Map(assignedList.map((tm) => [tm.id, tm])),
    [assignedList]
  )

  const defaultFormValues = useMemo(
    () =>
      reduce(
        assignedList,
        (result, tm) => (tm.read ? { ...result, [tm.id]: true } : result),
        {}
      ),
    [assignedList]
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
      const checkedIds = keys(pickBy(values, (val) => !!val))
      const checkedSet = new Set(checkedIds)
      const allIds = union(map(assignedList, 'id'), checkedIds)

      const translation_memories = allIds
        .map((id) => {
          const existing = assignedMap.get(id)
          return {
            id,
            read: checkedSet.has(id),
            write: existing?.write ?? false,
          }
        })
        .filter((tm) => tm.read || tm.write)

      try {
        await updateCatProjectTms(translation_memories)
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
    [assignedList, assignedMap, updateCatProjectTms]
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
