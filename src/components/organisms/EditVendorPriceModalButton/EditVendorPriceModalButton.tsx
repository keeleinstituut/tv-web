import { FC, useCallback } from 'react'
import {
  FormValues,
  PriceObject,
} from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ReactComponent as Edit } from 'assets/icons/edit.svg'
import { useTranslation } from 'react-i18next'
import { includes, join, keys, map, replace, toNumber, toString } from 'lodash'
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
  UseFormSetValue,
  useFormState,
  useWatch,
} from 'react-hook-form'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { ValidationError } from 'api/errorHandler'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useFetchSkills, useUpdatePrices } from 'hooks/requests/useVendors'
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

type EditVendorPriceModalButtonProps = {
  languagePairModalContent: PriceObject[]
  setValue: UseFormSetValue<FormValues>
  control: Control<FormValues>
  handleSubmit: UseFormHandleSubmit<FormValues>
  vendorId?: string
  resetForm: () => void
  setError: UseFormSetError<FormValues>
}

const EditVendorPriceModalButton: FC<EditVendorPriceModalButtonProps> = ({
  languagePairModalContent,
  control,
  setValue,
  handleSubmit,
  vendorId,
  resetForm,
  setError,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const { updatePrices } = useUpdatePrices(vendorId)

  const { skills: skillsData } = useFetchSkills()

  const isSubmitting = useFormState({ control }).isSubmitting

  const onEditPricesSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const pricesPayload = map(
        values.priceObject,
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

      const payload = {
        data: pricesPayload,
      }

      try {
        await updatePrices(payload)

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
            const payloadKey = keys(payload)[0]
            const priceObject = replace(typedKey, payloadKey, valuesKey)

            setError(priceObject, { type: 'backend', message: errorString })
          })
        }
      }
    },
    [resetForm, setError, t, updatePrices]
  )

  const formValues = useWatch({ control })

  console.log('formValues edit', formValues)

  const handleEditSinglePriceModal = (
    languagePairModalContent: PriceObject[]
  ) => {
    const languagePairModalData = map(
      languagePairModalContent,
      ({
        id,
        character_fee,
        hour_fee,
        minute_fee,
        minimal_fee,
        page_fee,
        word_fee,
        skill,
      }) => {
        return {
          id,
          character_fee,
          hour_fee,
          minimal_fee,
          minute_fee,
          page_fee,
          word_fee,
          skill_id: skill?.name || '',
        }
      }
    )

    setValue('priceObject', languagePairModalData)

    const srcLanguageValue =
      languagePairModalContent[0]?.source_language_classifier_value?.name || ''
    const dstLanguageValue =
      languagePairModalContent[0]?.destination_language_classifier_value
        ?.name || ''

    showModal(ModalTypes.EditableVendorPriceList, {
      submitForm: handleSubmit(onEditPricesSubmit),
      title: t('vendors.price_list_change'),
      helperText: t('vendors.price_list_change_description'),
      modalContent: (
        <VendorPriceListEditContent
          control={control}
          editableSkills={languagePairModalData}
          srcLanguageValue={srcLanguageValue}
          dstLanguageValues={[dstLanguageValue]}
        />
      ),
      isLoading: isSubmitting,
      resetForm: resetForm,
    })
  }

  const skillsFormFields: FieldProps<FormValues>[] = map(
    skillsData,
    ({ id, name }, index) => {
      return {
        key: index,
        inputType: InputTypes.Checkbox,
        ariaLabel: name || '',
        label: name,
        name: `priceObject.${id}.isSelected` as Path<FormValues>,
        className: classes.skillsField,
        rules: {
          required: false,
        },
      }
    }
  )

  console.log('skillsFormFields', skillsFormFields)

  const handleEditMultiplePriceModal = (
    languagePairModalContent: PriceObject[]
  ) => {
    const languagePairModalData = map(
      languagePairModalContent,
      ({
        id,
        character_fee,
        hour_fee,
        minute_fee,
        minimal_fee,
        page_fee,
        word_fee,
        skill,
      }) => {
        return {
          id,
          character_fee,
          hour_fee,
          minimal_fee,
          minute_fee,
          page_fee,
          word_fee,
          skill_id: skill?.name || '',
        }
      }
    )

    console.log('languagePairModalContent', languagePairModalContent)

    setValue('priceObject', languagePairModalData)

    const srcLanguageValue =
      languagePairModalContent[0]?.source_language_classifier_value?.name || ''
    const dstLanguageValue =
      languagePairModalContent[0]?.destination_language_classifier_value
        ?.name || ''

    const srcLanguageValueOption = {
      label: srcLanguageValue,
      value: srcLanguageValue,
    }
    const dstLanguageValueOption = {
      label: dstLanguageValue,
      value: dstLanguageValue,
    }

    showModal(ModalTypes.FormProgress, {
      formData: [
        {
          label: t('vendors.add_language_pairs'),
          title: t('vendors.choose_language_pairs'),
          helperText: t('vendors.language_pairs_helper_text'),
          modalContent: (
            <Root className={classes.languageLabelContainer}>
              <FormInput
                name={'name??'}
                ariaLabel={srcLanguageValue}
                control={control}
                defaultValue={srcLanguageValue}
                options={[srcLanguageValueOption] || []}
                inputType={InputTypes.Selections}
                dropdownSize={DropdownSizeTypes.L}
                disabled
                label={`${t('vendors.source_language')}*`}
                className={classes.languagePairSelection}
              />
              <FormInput
                name={'name??????????'}
                ariaLabel={dstLanguageValue}
                control={control}
                defaultValue={dstLanguageValue}
                options={[dstLanguageValueOption] || []}
                inputType={InputTypes.Selections}
                dropdownSize={DropdownSizeTypes.L}
                disabled
                label={`${t('vendors.destination_language')}*`}
                className={classes.languagePairSelection}
              />
            </Root>
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
              // languageOptions={languageFilter}
              customSkillsDynamicFormClass={classes.skillsDynamicForm}
            />
          ),
        },
        {
          // submitForm: handleSubmit(onEditPricesSubmit),
          label: t('vendors.add_price_list'),
          title: t('vendors.price_list_change'),
          helperText: t('vendors.price_list_change_description'),
          modalContent: (
            <VendorPriceListEditContent
              control={control}
              editableSkills={languagePairModalData}
              srcLanguageValue={srcLanguageValue}
              dstLanguageValues={[dstLanguageValue]}
            />
          ),
          isLoading: isSubmitting,
          resetForm: resetForm,
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
      icon={Edit}
      ariaLabel={t('vendors.edit_language_pair')}
      className={classes.editIcon}
      onClick={() => handleEditMultiplePriceModal(languagePairModalContent)}
      hidden={!includes(userPrivileges, Privileges.EditVendorDb)}
    />
  )
}

export default EditVendorPriceModalButton
