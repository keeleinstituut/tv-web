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
  join,
  map,
  some,
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
  useFetchSkills,
  useParallelMutationDepartment,
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

      const filteredEditSkills = filter(
        filteredSelectedSkills,
        (item: any) => item.id === undefined
      )

      const defaultPricesValues: any =
        defaultLanguagePairValues?.priceObject || {}

      const pricesValues: any = values[languageDirectionKey]?.priceObject || {}

      const deletedSkillsObjects = filter(
        defaultPricesValues,
        (value, key) =>
          value.isSelected === true &&
          pricesValues[key] &&
          pricesValues[key].isSelected === false
      )

      const addedSkillsObjects = filter(
        defaultPricesValues,
        (value, key) =>
          value.isSelected === false &&
          pricesValues[key] &&
          pricesValues[key].isSelected === true
      )

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
          skillData: any[],
          dstId = dst_lang_classifier_value_id?.id || ''
        ) =>
          compact(
            map(skillData, (skill) =>
              skill
                ? {
                    skill_id: skill.skill_id,
                    vendor_id: vendorId || '',
                    src_lang_classifier_value_id:
                      src_lang_classifier_value_id?.id || '',
                    dst_lang_classifier_value_id: dstId,
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

        const results = compact([
          deletedSkillsObjects.length > 0 && {
            prices: deletedSkillsObjects,
            state: DataStateTypes.DELETED,
          },
          addedSkillsObjects.length > 0 && {
            prices: newStateData(filteredEditSkills),
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
        if (errorData) {
          map(errorData, ({ errors }) => {
            const typedErrorData = errors as ValidationError

            if (typedErrorData) {
              map(
                typedErrorData as unknown as Record<string, unknown[]>,
                (errorsArray: unknown[], key) => {
                  const typedKey = key as FieldPath<FormValues>
                  const errorString = join(errorsArray ? errorsArray : '', ',')

                  if (includes(typedKey, 'dst_lang_classifier_value_id')) {
                    setError(
                      `${languageDirectionKey}.dst_lang_classifier_value_id.id`,
                      {
                        type: 'backend',
                        message: errorString,
                      }
                    )
                  }
                  if (includes(typedKey, 'src_lang_classifier_value_id')) {
                    setError(
                      `${languageDirectionKey}.src_lang_classifier_value_id.id`,
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
      vendorId,
    ]
  )

  const formValues = useWatch({ control })

  // console.log('formValues', formValues)

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
      buttonComponent: (
        <VendorPriceListButtons
          control={control}
          languageDirectionKey={languageDirectionKey}
        />
      ),
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
