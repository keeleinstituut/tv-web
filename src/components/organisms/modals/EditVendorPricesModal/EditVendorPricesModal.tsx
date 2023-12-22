import { FC, useCallback, useMemo } from 'react'
import {
  compact,
  concat,
  filter,
  find,
  flatMap,
  groupBy,
  isEmpty,
  isEqual,
  join,
  map,
  reduce,
  some,
  split,
  toNumber,
} from 'lodash'
import { SubmitHandler, useForm } from 'react-hook-form'

import {
  useAllPricesFetch,
  useParallelUpdatePrices,
  useSkillsCache,
} from 'hooks/requests/useVendors'

import FormProgressModal from '../FormProgressModal/FormProgressModal'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { PriceObject } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import VendorPriceListButtons from 'components/molecules/VendorPriceListButtons/VendorPriceListButtons'
import { SkillPrice } from 'components/organisms/VendorPriceManagementButton/VendorPriceManagementButton'
import { ClassifierValueType } from 'types/classifierValues'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import VendorPriceListSecondStep from 'components/organisms/VendorPriceListSecondStep/VendorPriceListSecondStep'
import VendorPriceListEditContent from 'components/organisms/VendorPriceListEditContent/VendorPriceListEditContent'
import { DataStateTypes } from '../EditableListModal/EditableListModal'
import { UpdatePricesPayload } from 'types/vendors'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { closeModal } from '../ModalRoot'
import { ValidationError } from 'api/errorHandler'
import { GetPricesPayload } from 'types/price'

interface PriceObjectWithOptionalId extends Omit<PriceObject, 'id'> {
  id?: string
}

const hasPriceChanged = (
  defaultObj: SkillPrice,
  valueObj: SkillPrice
): boolean => {
  return !isEqual(defaultObj, valueObj)
}

type DefaultPricesValues = {
  [x: string]: PriceObjectWithOptionalId
}

type FormValues = {
  [key in string]: {
    src_lang_classifier_value_id?: string
    dst_lang_classifier_value_id?: string
    skill_id?: { [key: string]: boolean }
    priceObject?: { [key in string]: PriceObjectWithOptionalId }
  }
}

export interface EditVendorPricesModalProps {
  languageDirectionKey?: string
  skillId?: string
  vendor_id?: string
  closeModal: () => void
  isModalOpen?: boolean
  filters?: GetPricesPayload
}

const EditVendorPricesModal: FC<EditVendorPricesModalProps> = ({
  languageDirectionKey,
  skillId,
  vendor_id,
  filters,
  ...rest
}) => {
  const { t } = useTranslation()
  const newLanguagePair = languageDirectionKey === 'new'
  const [src, dst] = split(languageDirectionKey, '_')

  const { parallelUpdating } = useParallelUpdatePrices({ vendor_id, filters })
  const { skills } = useSkillsCache() || {}
  const { prices: pricesData } = useAllPricesFetch({
    initialFilters: {
      vendor_id: vendor_id,
      lang_pair: [{ src, dst }],
      per_page: 50,
    },
    disabled: newLanguagePair,
    saveQueryParams: false,
  })
  const { classifierValuesFilters: languageFilter } = useClassifierValuesFetch({
    type: ClassifierValueType.Language,
  })

  const groupedPrices = groupBy(
    pricesData,
    (item) =>
      `${item.src_lang_classifier_value_id}_${item.dst_lang_classifier_value_id}`
  )

  const currentLanguagePrices = groupedPrices[languageDirectionKey || '']

  const defaultValues: FormValues = useMemo(() => {
    if (newLanguagePair) {
      return {
        new: {
          priceObject: reduce(
            skills,
            (result, skillData) => {
              return {
                ...result,
                [skillData.id]: {
                  isSelected: false,
                  skill_id: skillData.id,
                  skill: skillData,
                  character_fee: '0',
                  hour_fee: '0',
                  minimal_fee: '0',
                  minute_fee: '0',
                  page_fee: '0',
                  word_fee: '0',
                },
              }
            },
            {}
          ),
        },
      }
    }
    return {
      [languageDirectionKey || '']: {
        src_lang_classifier_value_id: src,
        dst_lang_classifier_value_id: dst,
        priceObject: reduce(
          skills,
          (result, skillData) => {
            const skillPrice = find(currentLanguagePrices, {
              skill_id: skillData.id,
            })
            if (!skillData) return result
            return {
              ...result,
              [skillData.id]: {
                isSelected: some(currentLanguagePrices, {
                  skill_id: skillData.id,
                }),
                skill_id: skillData.id,
                skill: skillData,
                character_fee: skillPrice?.character_fee || '0',
                hour_fee: skillPrice?.hour_fee || '0',
                minimal_fee: skillPrice?.minimal_fee || '0',
                minute_fee: skillPrice?.minute_fee || '0',
                page_fee: skillPrice?.page_fee || '0',
                word_fee: skillPrice?.word_fee || '0',
                id: skillPrice?.id,
              },
            }
          },
          {}
        ),
      },
    }
  }, [
    currentLanguagePrices,
    dst,
    languageDirectionKey,
    newLanguagePair,
    skills,
    src,
  ])

  const {
    handleSubmit,
    control,
    reset,
    setError,
    getValues,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    values: defaultValues,
    mode: 'onTouched',
  })

  const defaultLanguagePairValues = defaultValues[languageDirectionKey || '']

  const resetForm = useCallback(() => {
    reset()
  }, [reset])

  // useEffect(() => {
  //   resetForm()
  // }, [resetForm])

  const skillsFormFields: FieldProps<FormValues>[] = map(
    skills,
    ({ id, name }, index) => {
      return {
        key: index,
        inputType: InputTypes.Checkbox,
        ariaLabel: name || '',
        label: name,
        name: `${languageDirectionKey}.priceObject.${id}.isSelected`,
        className: classes.skillsField,
        rules: {
          required: false,
        },
      }
    }
  )

  const formValues = getValues()

  const srcLanguage =
    formValues[languageDirectionKey || '']?.src_lang_classifier_value_id || ''
  const dstLanguage =
    formValues[languageDirectionKey || '']?.dst_lang_classifier_value_id || ''

  const onEditPricesSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const {
        priceObject = {},
        src_lang_classifier_value_id,
        dst_lang_classifier_value_id,
      } = values[languageDirectionKey || '']

      const filteredSelectedSkills: PriceObjectWithOptionalId[] = filter(
        priceObject,
        'isSelected'
      )

      const filteredEditSkills = filter(
        filteredSelectedSkills,
        (item) => item.id === undefined
      )

      const defaultPricesValues: DefaultPricesValues =
        defaultLanguagePairValues?.priceObject || {}

      const deletedSkillsObjects = filter(
        defaultPricesValues,
        (value, key) =>
          value.isSelected === true &&
          priceObject[key] &&
          priceObject[key].isSelected === false
      )

      const addedSkillsObjects = filter(
        defaultPricesValues,
        (value, key) =>
          value.isSelected === false &&
          priceObject[key] &&
          priceObject[key].isSelected === true
      )

      const updatedSkillsObjects = reduce(
        priceObject,
        (result, defaultItem) => {
          const valueItem = find(defaultPricesValues, { id: defaultItem.id })
          if (
            valueItem &&
            valueItem.isSelected &&
            hasPriceChanged(defaultItem, valueItem)
          ) {
            return concat(result, [defaultItem])
          }
          return result
        },
        [] as SkillPrice[]
      )

      const getNewStateData = (
        skillData: PriceObjectWithOptionalId[],
        dstId?: string
      ) =>
        compact(
          map(skillData, (skill) =>
            skill
              ? {
                  skill_id: skill.skill_id,
                  vendor_id: vendor_id || '',
                  src_lang_classifier_value_id:
                    src_lang_classifier_value_id || '',
                  dst_lang_classifier_value_id:
                    dstId || dst_lang_classifier_value_id,
                  character_fee: skill.character_fee,
                  hour_fee: skill.hour_fee,
                  minimal_fee: skill.minimal_fee,
                  minute_fee: skill.minute_fee,
                  page_fee: skill.page_fee,
                  word_fee: skill.word_fee,
                  ...(skill.id && { id: skill.id }),
                }
              : undefined
          )
        )

      const deletedSkills = isEmpty(deletedSkillsObjects)
        ? null
        : {
            prices: deletedSkillsObjects,
            state: DataStateTypes.DELETED,
          }

      const newSkills = {
        prices: flatMap(dst_lang_classifier_value_id, (dst_id) =>
          getNewStateData(filteredSelectedSkills, dst_id)
        ),
        state: DataStateTypes.NEW,
      }

      const newSkillsWhileEditing = isEmpty(addedSkillsObjects)
        ? null
        : {
            prices: getNewStateData(filteredEditSkills),
            state: DataStateTypes.NEW,
          }

      const updateAbleSkills = filter(
        updatedSkillsObjects,
        ({ id }) => !find(deletedSkills?.prices, { id })
      )

      const updateSkills = isEmpty(updateAbleSkills)
        ? null
        : {
            prices: updateAbleSkills,
            state: DataStateTypes.UPDATED,
          }

      const updatePricesPayload: UpdatePricesPayload = {
        data: newLanguagePair
          ? [newSkills]
          : compact([deletedSkills, newSkillsWhileEditing, updateSkills]),
      }

      try {
        await parallelUpdating(updatePricesPayload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: newLanguagePair
            ? t('success.language_pairs_prices_added')
            : t('success.language_pairs_prices_updated'),
        })

        resetForm()
        closeModal()
      } catch (errorData) {
        if (errorData) {
          map(errorData, ({ error, state }) => {
            const typedErrorData = error as {
              errors?: ValidationError
              state?: string
            }
            const errors = typedErrorData?.errors

            if (errors) {
              map(
                errors as unknown as Record<string, unknown[]>,
                (errorsArray: unknown[], key) => {
                  const errorString = join(errorsArray ? errorsArray : '', ',')
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const [_, arrayIndex, fieldName] = split(key, '.')
                  const erroredPrices = find(updatePricesPayload.data, {
                    state,
                  })?.prices

                  if (
                    fieldName === 'dst_lang_classifier_value_id' ||
                    fieldName === 'src_lang_classifier_value_id'
                  ) {
                    setError(`${languageDirectionKey}.${fieldName}`, {
                      type: 'backend',
                      message: errorString,
                    })
                  } else if (fieldName === 'skill_id') {
                    setError(
                      `${languageDirectionKey}.priceObject.${
                        erroredPrices?.[toNumber(arrayIndex)]?.skill_id
                      }.isSelected`,
                      {
                        type: 'backend',
                        message: errorString,
                      }
                    )
                  } else {
                    setError(
                      `${languageDirectionKey}.priceObject.${
                        erroredPrices?.[toNumber(arrayIndex)]?.skill_id
                      }.${fieldName}`,
                      {
                        type: 'backend',
                        message: errorString,
                      }
                    )
                  }
                }
              )
            }
          })
        }
      }
    },
    [
      defaultLanguagePairValues?.priceObject,
      languageDirectionKey,
      newLanguagePair,
      parallelUpdating,
      resetForm,
      setError,
      t,
      vendor_id,
    ]
  )

  const languagePairFormFields: FieldProps<FormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.Selections,
        name: `${languageDirectionKey}.src_lang_classifier_value_id`,
        ariaLabel: t('vendors.source_language'),
        label: `${t('vendors.source_language')}*`,
        placeholder: t('button.choose'),
        options: languageFilter,
        showSearch: true,
        rules: {
          required: true,
        },
        usePortal: true,
        className: classes.languagePairSelection,
        disabled: !newLanguagePair,
      },
      {
        inputType: InputTypes.Selections,
        name: `${languageDirectionKey}.dst_lang_classifier_value_id`,
        ariaLabel: t('vendors.destination_language'),
        label: `${t('vendors.destination_language')}*`,
        placeholder: t('button.choose'),
        options: languageFilter,
        multiple: newLanguagePair,
        showSearch: true,
        buttons: true,
        rules: {
          required: true,
        },
        usePortal: true,
        className: classes.languagePairSelection,
        disabled: !newLanguagePair,
      },
    ],
    [languageDirectionKey, languageFilter, newLanguagePair, t]
  )

  const formData = useMemo(
    () => [
      {
        label: t('vendors.add_language_pairs'),
        title: t('vendors.choose_language_pairs'),
        helperText: t('vendors.language_pairs_helper_text'),
        modalContent: (
          <DynamicForm
            fields={languagePairFormFields}
            control={control}
            className={classes.languageLabelContainer}
          />
        ),
      },
      {
        label: t('vendors.add_skills'),
        title: t('vendors.choose_skills'),
        helperText: t('vendors.skills_helper_text'),
        modalContent: (
          <VendorPriceListSecondStep<FormValues>
            skillsFormFields={skillsFormFields}
            control={control}
            customSkillsDynamicFormClass={classes.skillsDynamicForm}
            srcLanguageValue={srcLanguage}
            dstLanguageValues={
              typeof dstLanguage === 'string' ? [dstLanguage] : dstLanguage
            }
            languageOptions={languageFilter}
          />
        ),
      },
      {
        label: t('vendors.add_price_list'),
        title: t('vendors.price_list_change'),
        helperText: t('vendors.price_list_change_description'),
        modalContent: (
          <VendorPriceListEditContent
            control={control}
            languageDirectionKey={languageDirectionKey || ''}
            srcLanguageValue={srcLanguage}
            dstLanguageValues={
              typeof dstLanguage === 'string' ? [dstLanguage] : dstLanguage
            }
            languageOptions={languageFilter}
            skillId={skillId}
            getValues={getValues}
          />
        ),
        resetForm: resetForm,
        showOnly: !!skillId,
      },
    ],
    [
      control,
      dstLanguage,
      getValues,
      languageDirectionKey,
      languageFilter,
      languagePairFormFields,
      resetForm,
      skillId,
      skillsFormFields,
      srcLanguage,
      t,
    ]
  )

  return (
    <FormProgressModal
      {...rest}
      submitForm={handleSubmit(onEditPricesSubmit)}
      resetForm={resetForm}
      formData={formData}
      buttonComponent={
        <VendorPriceListButtons
          control={control}
          languageDirectionKey={languageDirectionKey}
          isLoading={isSubmitting}
        />
      }
      control={control}
    />
  )
}

export default EditVendorPricesModal
