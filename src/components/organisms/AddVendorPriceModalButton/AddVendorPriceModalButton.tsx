import { FC, useCallback } from 'react'
import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as AddIcon } from 'assets/icons/add.svg'
import { useTranslation } from 'react-i18next'
import {
  flatMap,
  includes,
  join,
  keys,
  map,
  pickBy,
  replace,
  toNumber,
} from 'lodash'
import {
  ModalTypes,
  closeModal,
  showModal,
} from 'components/organisms/modals/ModalRoot'
import {
  Control,
  FieldPath,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormSetError,
} from 'react-hook-form'
import { showNotification } from '../NotificationRoot/NotificationRoot'
import { ValidationError } from 'api/errorHandler'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useCreatePrices, useFetchSkills } from 'hooks/requests/useVendors'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import VendorPriceListSecondStep from 'components/organisms/VendorPriceListSecondStep/VendorPriceListSecondStep'
import VendorPriceListThirdStep from 'components/organisms/VendorPriceListThirdStep/VendorPriceListThirdStep'
import VendorPriceListButtons from 'components/molecules/VendorPriceListButtons/VendorPriceListButtons'
import { CreatePricesPayload } from 'types/vendors'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'

import classes from './classes.module.scss'

type AddVendorPriceModalButtonProps = {
  control: Control<FormValues>
  handleSubmit: UseFormHandleSubmit<FormValues>
  vendorId?: string
  resetForm: () => void
  setError: UseFormSetError<FormValues>
}

const AddVendorPriceModalButton: FC<AddVendorPriceModalButtonProps> = ({
  control,
  handleSubmit,
  vendorId,
  resetForm,
  setError,
}) => {
  const { t } = useTranslation()

  const { createPrices, isLoading: isCreatingPrices } =
    useCreatePrices(vendorId)

  const { classifierValuesFilters: languageFilter } = useClassifierValuesFetch({
    type: ClassifierValueType.Language,
  })

  const { data: skillsData } = useFetchSkills()

  const languagePairFormFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'src_lang_classifier_value_id',
      ariaLabel: t('vendors.source_language'),
      label: `${t('vendors.source_language')}*`,
      placeholder: t('button.choose'),
      options: languageFilter,
      rules: {
        required: true,
      },
      usePortal: true,
      className: classes.languagePairSelection,
    },
    {
      inputType: InputTypes.Selections,
      name: 'dst_lang_classifier_value_id',
      ariaLabel: t('vendors.destination_language'),
      label: `${t('vendors.destination_language')}*`,
      placeholder: t('button.choose'),
      options: languageFilter,
      multiple: true,
      buttons: true,
      rules: {
        required: true,
      },
      usePortal: true,
      className: classes.languagePairSelection,
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
        name: `skill_id.${id}_${index}`,
        className: classes.skillsField,
        rules: {
          required: true,
        },
      }
    }
  )

  const onAddPricesSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const transformedArray = flatMap(
        values.dst_lang_classifier_value_id,
        (dstValue) =>
          map(
            keys(pickBy(values.skill_id, (value) => value === true)),
            (key, index) => {
              return {
                vendor_id: vendorId || '',
                skill_id: key.replace(/_\d+$/, '') || '',
                src_lang_classifier_value_id:
                  values['src_lang_classifier_value_id'] || '',
                dst_lang_classifier_value_id: dstValue || '',
                character_fee: toNumber(values[`character_fee-${index}`]) || 0,
                word_fee: toNumber(values[`word_fee-${index}`]) || 0,
                page_fee: toNumber(values[`page_fee-${index}`]) || 0,
                minute_fee: toNumber(values[`minute_fee-${index}`]) || 0,
                hour_fee: toNumber(values[`hour_fee-${index}`]) || 0,
                minimal_fee: toNumber(values[`minimal_fee-${index}`]) || 0,
              }
            }
          )
      )

      const payload: CreatePricesPayload = {
        data: [...transformedArray],
      }

      try {
        await createPrices(payload)

        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.language_pairs_prices_added'),
        })
        resetForm()
        closeModal()
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError

        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
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

            if (includes(typedKey, dstLangClassifierResult)) {
              setError(dstLangClassifierResult, {
                type: 'backend',
                message: errorString,
              })
            }
            if (includes(typedKey, srcLangClassifierResult)) {
              setError(srcLangClassifierResult, {
                type: 'backend',
                message: errorString,
              })
            }
          })
        }
      }
    },
    [createPrices, resetForm, setError, t, vendorId]
  )

  const handleAddPriceModal = () => {
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
              className={classes.languagePairDynamicForm}
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
              languageOptions={languageFilter}
              customSkillsDynamicFormClass={classes.skillsDynamicForm}
            />
          ),
        },
        {
          label: t('vendors.add_price_list'),
          title: t('vendors.set_price_list'),
          helperText: t('vendors.price_list_helper_text'),
          modalContent: (
            <VendorPriceListThirdStep
              control={control}
              languageOptions={languageFilter}
            />
          ),
        },
      ],
      submitForm: handleSubmit(onAddPricesSubmit),
      resetForm: resetForm(),
      buttonComponent: (
        <VendorPriceListButtons
          control={control}
          isLoading={isCreatingPrices}
        />
      ),
      control: control,
    })
  }

  return (
    <Button
      appearance={AppearanceTypes.Text}
      icon={AddIcon}
      iconPositioning={IconPositioningTypes.Left}
      onClick={handleAddPriceModal}
      className={classes.pricesLanguageButton}
    >
      {t('vendors.add_language_directions')}
    </Button>
  )
}

export default AddVendorPriceModalButton
