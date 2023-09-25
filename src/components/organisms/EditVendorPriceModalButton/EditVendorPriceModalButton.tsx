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
  filter,
  includes,
  isEmpty,
  join,
  keys,
  map,
  reduce,
  reject,
  replace,
  toNumber,
  toString,
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
  useFetchSkills,
  useUpdatePrices,
} from 'hooks/requests/useVendors'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'

import classes from './classes.module.scss'
import VendorPriceListButtons from 'components/molecules/VendorPriceListButtons/VendorPriceListButtons'
import DynamicForm, {
  FieldProps,
  FormInput,
  InputTypes,
} from '../DynamicForm/DynamicForm'
import { DropdownSizeTypes } from '../SelectionControlsInput/SelectionControlsInput'
import { Root } from '@radix-ui/react-form'
import VendorPriceListSecondStep from '../VendorPriceListSecondStep/VendorPriceListSecondStep'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'

type EditVendorPriceModalButtonProps = {
  control: Control<FormValues>
  handleSubmit: UseFormHandleSubmit<FormValues>
  vendorId: string
  resetForm: () => void
  setError: UseFormSetError<FormValues>
  languageDirectionKey: string
  skillId?: string
}

const EditVendorPriceModalButton: FC<EditVendorPriceModalButtonProps> = ({
  control,
  handleSubmit,
  vendorId,
  resetForm,
  setError,
  languageDirectionKey,
  skillId,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const { updatePrices } = useUpdatePrices(vendorId)
  const { createPrices } = useCreatePrices(vendorId)

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

      const filteredUpdateSkills = filter(priceObject, 'id')
      const filteredNewSkills = reject(filteredSelectedSkills, 'id')

      // const priceFormat = {
      //   character_fee: toNumber(replace(toString(character_fee), '€', '')),
      //   hour_fee: toNumber(replace(toString(hour_fee), '€', '')),
      //   minimal_fee: toNumber(replace(toString(minimal_fee), '€', '')),
      //   minute_fee: toNumber(replace(toString(minute_fee), '€', '')),
      //   page_fee: toNumber(replace(toString(page_fee), '€', '')),
      //   word_fee: toNumber(replace(toString(word_fee), '€', '')),
      // }

      const updatePricesData = map(
        filteredUpdateSkills as unknown as PriceObject[],
        ({
          character_fee,
          hour_fee,
          minimal_fee,
          minute_fee,
          page_fee,
          word_fee,
          id,
        }) => {
          return {
            id,
            character_fee: toNumber(replace(toString(character_fee), '€', '')),
            hour_fee: toNumber(replace(toString(hour_fee), '€', '')),
            minimal_fee: toNumber(replace(toString(minimal_fee), '€', '')),
            minute_fee: toNumber(replace(toString(minute_fee), '€', '')),
            page_fee: toNumber(replace(toString(page_fee), '€', '')),
            word_fee: toNumber(replace(toString(word_fee), '€', '')),
          }
        }
      )

      const newPricesData = map(
        filteredNewSkills as unknown as PriceObject[],
        ({
          character_fee,
          hour_fee,
          minimal_fee,
          minute_fee,
          page_fee,
          word_fee,
          id,
          skill_id,
        }) => {
          return {
            id,
            skill_id,
            vendor_id: vendorId || '',
            src_lang_classifier_value_id:
              src_lang_classifier_value_id?.id || '',
            dst_lang_classifier_value_id:
              dst_lang_classifier_value_id?.id || '',
            character_fee: toNumber(replace(toString(character_fee), '€', '')),
            hour_fee: toNumber(replace(toString(hour_fee), '€', '')),
            minimal_fee: toNumber(replace(toString(minimal_fee), '€', '')),
            minute_fee: toNumber(replace(toString(minute_fee), '€', '')),
            page_fee: toNumber(replace(toString(page_fee), '€', '')),
            word_fee: toNumber(replace(toString(word_fee), '€', '')),
          }
        }
      )

      const updatePricesPayload = {
        data: updatePricesData,
      }
      const newPricesPayload = {
        data: newPricesData,
      }

      try {
        if (!isEmpty(updatePricesPayload.data)) {
          await updatePrices(updatePricesPayload)
        }

        if (!isEmpty(newPricesPayload.data)) {
          await createPrices(newPricesPayload)
        }

        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.language_pairs_prices_updated'),
        })
        resetForm()
        closeModal()
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError

        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
            const valuesKey = keys(values)[0]

            // const payloadKey = keys(payload)[0]
            // const priceObject = replace(typedKey, payloadKey, valuesKey)

            // setError(priceObject, { type: 'backend', message: errorString })
          })
        }
      }
    },
    [resetForm, t]
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

export default EditVendorPriceModalButton
