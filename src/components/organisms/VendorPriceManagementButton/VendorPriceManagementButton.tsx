import { FC, useCallback } from 'react'
import {
  FormValues,
  PriceObject,
} from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as Edit } from 'assets/icons/edit.svg'
import { ReactComponent as AddIcon } from 'assets/icons/add.svg'
import { useTranslation } from 'react-i18next'
import {
  compact,
  filter,
  find,
  flatMap,
  includes,
  isArray,
  join,
  keys,
  map,
  replace,
  some,
  split,
  toNumber,
} from 'lodash'
import {
  ModalTypes,
  closeModal,
  showModal,
} from 'components/organisms/modals/ModalRoot'
import VendorPriceListEditContent from 'components/organisms/VendorPriceListEditContent/VendorPriceListEditContent'
import {
  Control,
  FieldPath,
  Path,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormSetError,
  useFormState,
  useWatch,
} from 'react-hook-form'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { ValidationError } from 'api/errorHandler'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import {
  useCreatePrices,
  useDeletePrices,
  useFetchSkills,
  useParallelMutationDepartment,
  useUpdatePrices,
} from 'hooks/requests/useVendors'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import VendorPriceListButtons from 'components/molecules/VendorPriceListButtons/VendorPriceListButtons'
import DynamicForm, { FieldProps, InputTypes } from '../DynamicForm/DynamicForm'
import VendorPriceListSecondStep from '../VendorPriceListSecondStep/VendorPriceListSecondStep'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'

import classes from './classes.module.scss'
import { DataStateTypes } from '../modals/EditableListModal/EditableListModal'

type VendorPriceManagementButtonProps = {
  control: Control<FormValues>
  handleSubmit: UseFormHandleSubmit<FormValues>
  vendorId: string
  resetForm: () => void
  setError: UseFormSetError<FormValues>
  languageDirectionKey: string
  skillId?: string
  defaultLanguagePairValues?: {
    src_lang_classifier_value_id?: {
      name: string
      id: string
    }
    dst_lang_classifier_value_id?: {
      name: string
      id: string
    }
    skill_id?: {
      [key: string]: boolean
    }
    priceObject?: { [x: string]: PriceObject[] }
  }
}

export type PriceObject2 = {
  id: string
  isSelected: boolean
  character_fee: number | string
  word_fee: number | string
  page_fee: number | string
  minute_fee: number | string
  hour_fee: number | string
  minimal_fee: number | string
  skill_id: string
  skill: { id: string; name: string }
}

const VendorPriceManagementButton: FC<VendorPriceManagementButtonProps> = ({
  control,
  handleSubmit,
  vendorId,
  resetForm,
  setError,
  languageDirectionKey,
  skillId,
  defaultLanguagePairValues,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const { parallelUpdating } = useParallelMutationDepartment(vendorId)

  const { skills: skillsData } = useFetchSkills()
  const { classifierValuesFilters: languageFilter } = useClassifierValuesFetch({
    type: ClassifierValueType.Language,
  })

  const isSubmitting = useFormState({ control }).isSubmitting
  const newLanguagePair = languageDirectionKey === 'new'

  const onEditPricesSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const {
        priceObject,
        src_lang_classifier_value_id,
        dst_lang_classifier_value_id,
      } = values[languageDirectionKey]

      const filteredSelectedSkills = filter(priceObject, 'isSelected')

      console.log('VALUES', values)

      const defaultPricesValues: any =
        defaultLanguagePairValues?.priceObject || {}

      const pricesValues: any = values[languageDirectionKey]?.priceObject || {}

      const deletedSkillsObjects = filter(defaultPricesValues, (value, key) => {
        return (
          value.isSelected === true &&
          pricesValues[key] &&
          pricesValues[key].isSelected === false
        )
      })

      const addedSkillsObjects = filter(defaultPricesValues, (value, key) => {
        return (
          value.isSelected === false &&
          pricesValues[key] &&
          pricesValues[key].isSelected === true
        )
      })

      const hasPriceChanged = (defaultObj: any, valueObj: any): boolean => {
        const propertiesToCheck = [
          'word_fee',
          'page_fee',
          'minute_fee',
          'minimal_fee',
          'hour_fee',
          'character_fee',
        ]

        return some(
          propertiesToCheck,
          (property) => defaultObj[property] !== valueObj[property]
        )
      }

      const updatedSkillsObjects = filter(pricesValues, (defaultItem) => {
        const valueItem = find(defaultPricesValues, { id: defaultItem.id })
        return (
          valueItem &&
          valueItem.isSelected &&
          hasPriceChanged(defaultItem, valueItem)
        )
      })

      const modifiedPayload = () => {
        const newStateData = (
          skills: any[],
          dstId = dst_lang_classifier_value_id?.id || ''
        ) =>
          compact(
            map(skills, (skillData) =>
              skillData
                ? {
                    skill_id: skillData.skill_id,
                    vendor_id: vendorId || '',
                    src_lang_classifier_value_id:
                      src_lang_classifier_value_id?.id || '',
                    dst_lang_classifier_value_id: dstId,
                    character_fee: skillData.character_fee,
                    hour_fee: skillData.hour_fee,
                    minimal_fee: skillData.minimal_fee,
                    minute_fee: skillData.minute_fee,
                    page_fee: skillData.page_fee,
                    word_fee: skillData.word_fee,
                    ...(skillData.id && { id: skillData.id }),
                  }
                : undefined
            )
          )

        const results = compact([
          deletedSkillsObjects.length > 0 && {
            prices: deletedSkillsObjects,
            state: DataStateTypes.DELETED,
          },
          addedSkillsObjects.length > 0 && {
            prices: newStateData(addedSkillsObjects),
            state: DataStateTypes.NEW,
          },
          !addedSkillsObjects.length &&
            newLanguagePair && {
              prices: flatMap(dst_lang_classifier_value_id?.id, (dst_id) =>
                newStateData(filteredSelectedSkills, dst_id)
              ),
              state: DataStateTypes.NEW,
            },
          updatedSkillsObjects.length > 0 && {
            prices: map(updatedSkillsObjects, ({ id, ...rest }) => ({
              id,
              ...rest,
            })),
            state: DataStateTypes.UPDATED,
          },
        ])

        return results
      }

      const payload = modifiedPayload()

      const updatePricesPayload = {
        data: payload,
      }

      try {
        await parallelUpdating(updatePricesPayload)

        newLanguagePair
          ? showNotification({
              type: NotificationTypes.Success,
              title: t('notification.announcement'),
              content: t('success.language_pairs_prices_added'),
            })
          : showNotification({
              type: NotificationTypes.Success,
              title: t('notification.announcement'),
              content: t('success.language_pairs_prices_updated'),
            })

        resetForm()
        closeModal()
      } catch (errorData) {
        console.log('ERRORDATA**', errorData)

        // const typedErrorData = errorData as ValidationError

        const errorArray = isArray(errorData) ? errorData : [errorData]
        map(errorArray, (error) => {
          const typedErrorData = error as ValidationError
          if (typedErrorData.errors) {
            map(typedErrorData.errors, (errorsArray, key) => {
              const typedKey = key as FieldPath<FormValues>
              const tKey = split(typedKey, '.')[1]
              const errorString = join(errorsArray, ',')
              // if (tKey) {
              //   const inputName = payload[toNumber(tKey)].id || `new_${tKey}`
              //   setError(
              //     inputName,
              //     { type: 'backend', message: errorString },
              //     { shouldFocus: true }
              //   )
              // }

              console.log('errorsArray', errorsArray)
              console.log('typedKey', typedKey)
              console.log('errorString', errorString)

              const payloadKey = keys(payload)[0]
              const dstLangClassifierResult = replace(
                typedKey,
                `${payloadKey}.0.`,
                ''
              )

              console.log('dstLangClassifierResult', dstLangClassifierResult)

              const srcLangClassifierResult = replace(
                typedKey,
                `${payloadKey}.0.`,
                ''
              )
              const vendorIdResult = replace(typedKey, `${payloadKey}.0.`, '')

              if (includes(typedKey, dstLangClassifierResult)) {
                setError(dstLangClassifierResult, {
                  type: 'backend',
                  message: 'bu1',
                })
              }
              if (includes(typedKey, srcLangClassifierResult)) {
                setError(srcLangClassifierResult, {
                  type: 'backend',
                  message: 'bu2',
                })
              }
              if (includes(typedKey, vendorIdResult)) {
                setError(vendorIdResult, {
                  type: 'backend',
                  message: 'bu3',
                })
              }
            })
          }
        })

        if (errorData) {
          map(errorData, ({ errors }) => {
            console.log('errors', errors)

            const typedErrorData = errors as ValidationError

            if (typedErrorData) {
              map(typedErrorData, (errorsArray, key) => {
                const typedKey = key as FieldPath<FormValues>
                // const errorString = join(errorsArray ? errorsArray : '', ',')
                const valuesKey = keys(values)[0]

                console.log('typedKey', typedKey)
                // console.log('errorString', errorString)
                console.log('errorsArray', errorsArray)
                console.log('valuesKey', valuesKey)

                // const priceObject = replace(typedKey, payloadKey, valuesKey)

                // setError(priceObject, { type: 'backend', message: errorString })

                const payloadKey = keys(payload)[0]
                const dstLangClassifierResult = replace(
                  typedKey,
                  `${payloadKey}.0.`,
                  ''
                )
                const srcLangClassifierResult = replace(
                  typedKey,
                  `${payloadKey}.0.`,
                  ''
                )
                const vendorIdResult = replace(typedKey, `${payloadKey}.0.`, '')

                if (includes(typedKey, dstLangClassifierResult)) {
                  setError(dstLangClassifierResult, {
                    type: 'backend',
                    message: 'bu1',
                  })
                }
                if (includes(typedKey, srcLangClassifierResult)) {
                  setError(srcLangClassifierResult, {
                    type: 'backend',
                    message: 'bu2',
                  })
                }
                if (includes(typedKey, vendorIdResult)) {
                  setError(vendorIdResult, {
                    type: 'backend',
                    message: 'bu3',
                  })
                }
              })
            }
          })
        }

        // if (typedErrorData.errors) {
        //   map(typedErrorData.errors, (errorsArray, key) => {
        //     const typedKey = key as FieldPath<FormValues>
        //     const errorString = join(errorsArray, ',')
        //     const valuesKey = keys(values)[0]

        //     console.log('typedKey', typedKey)
        //     console.log('errorString', errorString)
        //     console.log('errorsArray', errorsArray)

        //     // const payloadKey = keys(payload)[0]
        //     // const priceObject = replace(typedKey, payloadKey, valuesKey)

        //     // setError(priceObject, { type: 'backend', message: errorString })

        //     // const payloadKey = keys(payload)[0]
        //     // const dstLangClassifierResult = replace(
        //     //   typedKey,
        //     //   `${payloadKey}.0.`,
        //     //   ''
        //     // )
        //     // const srcLangClassifierResult = replace(
        //     //   typedKey,
        //     //   `${payloadKey}.0.`,
        //     //   ''
        //     // )
        //     // const vendorIdResult = replace(typedKey, `${payloadKey}.0.`, '')

        //     // if (includes(typedKey, dstLangClassifierResult)) {
        //     //   setError(dstLangClassifierResult, {
        //     //     type: 'backend',
        //     //     message: errorString,
        //     //   })
        //     // }
        //     // if (includes(typedKey, srcLangClassifierResult)) {
        //     //   setError(srcLangClassifierResult, {
        //     //     type: 'backend',
        //     //     message: errorString,
        //     //   })
        //     // }
        //     // if (includes(typedKey, vendorIdResult)) {
        //     //   setError(vendorIdResult, {
        //     //     type: 'backend',
        //     //     message: errorString,
        //     //   })
        //     // }
        //   })
        // }
      }
    },
    [resetForm, t]
  )

  const formValues = useWatch({ control })

  const srcLanguage =
    formValues[languageDirectionKey]?.src_lang_classifier_value_id?.name || ''
  const dstLanguage =
    formValues[languageDirectionKey]?.dst_lang_classifier_value_id?.name || ''

  const languagePairFormFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: `${languageDirectionKey}.src_lang_classifier_value_id.id`,
      ariaLabel: t('vendors.source_language'),
      label: `${t('vendors.source_language')}*`,
      placeholder: t('button.choose'),
      options: languageFilter,
      rules: {
        required: true,
      },
      usePortal: true,
      className: classes.languagePairSelection,
      disabled: !newLanguagePair,
    },
    {
      inputType: InputTypes.Selections,
      name: `${languageDirectionKey}.dst_lang_classifier_value_id.id`,
      ariaLabel: t('vendors.destination_language'),
      label: `${t('vendors.destination_language')}*`,
      placeholder: t('button.choose'),
      options: languageFilter,
      multiple: newLanguagePair,
      buttons: true,
      rules: {
        required: true,
      },
      usePortal: true,
      className: classes.languagePairSelection,
      disabled: !newLanguagePair,
    },
  ]

  const skillsFormFields: FieldProps<FormValues>[] = map(
    skillsData,
    ({ id, name }, index) => {
      return {
        key: index,
        inputType: InputTypes.Checkbox,
        ariaLabel: name || '',
        label: name,
        name: `${languageDirectionKey}.priceObject.${id}.isSelected` as Path<FormValues>,
        className: classes.skillsField,
        rules: {
          required: false,
        },
      }
    }
  )

  const handleEditPriceModal = () => {
    showModal(ModalTypes.FormProgress, {
      formData: [
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
            <VendorPriceListSecondStep
              skillsFormFields={skillsFormFields}
              control={control}
              customSkillsDynamicFormClass={classes.skillsDynamicForm}
              srcLanguageValue={srcLanguage}
              dstLanguageValues={[dstLanguage]}
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
              languageDirectionKey={languageDirectionKey}
              srcLanguageValue={srcLanguage}
              dstLanguageValues={[dstLanguage]}
              languageOptions={languageFilter}
              skillId={skillId}
            />
          ),
          isLoading: isSubmitting,
          resetForm: resetForm,
          showOnly: skillId,
        },
      ],
      submitForm: handleSubmit(onEditPricesSubmit),
      resetForm: resetForm(),
      buttonComponent: <VendorPriceListButtons control={control} />,
      control: control,
    })
  }

  return (
    <Button
      appearance={AppearanceTypes.Text}
      icon={newLanguagePair ? AddIcon : Edit}
      ariaLabel={t('vendors.edit_language_pair')}
      className={newLanguagePair ? classes.languageButton : classes.editIcon}
      onClick={handleEditPriceModal}
      hidden={!includes(userPrivileges, Privileges.EditVendorDb)}
      children={newLanguagePair && t('vendors.add_language_directions')}
      iconPositioning={newLanguagePair ? IconPositioningTypes.Left : undefined}
    />
  )
}

export default VendorPriceManagementButton
