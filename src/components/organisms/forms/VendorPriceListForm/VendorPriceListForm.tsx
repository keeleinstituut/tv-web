import { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  compact,
  find,
  findIndex,
  flatMap,
  get,
  isEmpty,
  keyBy,
  keys,
  map,
  pickBy,
  toNumber,
} from 'lodash'
import { Root } from '@radix-ui/react-form'
import {
  useCreatePrices,
  useFetchPrices,
  useFetchSkills,
  useUpdatePrices,
} from 'hooks/requests/useVendors'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { ReactComponent as AddIcon } from 'assets/icons/add.svg'
import { ReactComponent as Edit } from 'assets/icons/edit.svg'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Control, SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import dayjs from 'dayjs'
import AddVendorPricesTable from 'components/organisms/tables/AddVendorPricesTable/AddVendorPricesTable'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { VendorFormProps } from '../VendorForm/VendorForm'
import { ClassifierValueType } from 'types/classifierValues'
import {
  CreatePricesPayload,
  OrderBy,
  OrderDirection,
  PricesData,
} from 'types/vendors'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import LanguageLabels from 'components/atoms/LanguageLabels/LanguageLabels'
import { showValidationErrorMessage } from 'api/errorHandler'
import VendorPriceListButtons from 'components/molecules/VendorPriceListButtons/VendorPriceListButtons'
import EditVendorPricesTable from 'components/organisms/tables/EditVendorPricesTable/EditVendorPricesTable'

import classes from './classes.module.scss'

export type PriceObject = {
  id: string
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  skill_id: string
}

export type FormValues = {
  src_lang_classifier_value_id?: string
  dst_lang_classifier_value_id?: string
  skill_id?: { [key: string]: boolean }
  priceObject?: PriceObject[]
} & {
  [key: string]: number | string | undefined
}

export type Prices = {
  id: string
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  skill_id: Skill
  language_direction: string
}

export type Skill = {
  id?: string
  name?: string
}

export type VendorPriceListSecondStepProps = {
  skillsFormFields: FieldProps<FormValues>[]
  control: Control<FormValues>
  languageOptions?: { label: string; value: string }[]
}

export type VendorPriceListThirdStepProps = Omit<
  VendorPriceListSecondStepProps,
  'skillsFormFields'
>

export type VendorPriceListEditContentProps = {
  control: Control<FormValues>
  editableSkill: PriceObject[]
  srcLanguageValue?: string
  dstLanguageValues?: string[]
}

const VendorPriceListSecondStep: FC<VendorPriceListSecondStepProps> = ({
  skillsFormFields,
  control,
  languageOptions,
}) => {
  return (
    <>
      <LanguageLabels control={control} languageOptions={languageOptions} />
      <DynamicForm
        fields={skillsFormFields}
        control={control}
        className={classes.skillsDynamicForm}
      />
    </>
  )
}

const VendorPriceListThirdStep: FC<VendorPriceListThirdStepProps> = ({
  control,
  languageOptions,
}) => {
  const selectedSkills = useWatch({ control, name: 'skill_id' })

  return (
    <>
      <LanguageLabels control={control} languageOptions={languageOptions} />
      <Root>
        <AddVendorPricesTable
          selectedSkills={selectedSkills}
          control={control}
        />
      </Root>
    </>
  )
}

const VendorPriceListEditContent: FC<VendorPriceListEditContentProps> = ({
  control,
  editableSkill,
  srcLanguageValue,
  dstLanguageValues,
}) => {
  return (
    <>
      <LanguageLabels
        control={control}
        srcLanguageValue={srcLanguageValue}
        dstLanguageValues={dstLanguageValues}
      />
      <Root>
        <EditVendorPricesTable
          editableSkill={editableSkill}
          control={control}
        />
      </Root>
    </>
  )
}

const VendorPriceListForm: FC<VendorFormProps> = ({ vendor }) => {
  const { t } = useTranslation()

  const { data: skillsData } = useFetchSkills()
  const { classifierValuesFilters: languageFilter } = useClassifierValuesFetch({
    type: ClassifierValueType.Language,
  })

  const { prices, id: vendor_id } = vendor

  const { createPrices, isLoading: isCreatingPrices } =
    useCreatePrices(vendor_id)

  const { updatePrices, isLoading: isUpdatingPrices } =
    useUpdatePrices(vendor_id)

  const { data: pricesData } = useFetchPrices({
    vendor_id,
    limit: 1,
    order_by: OrderBy.CreatedAt,
    order_direction: OrderDirection.Asc,
  })

  const priceListCreated = dayjs(
    pricesData ? pricesData[0]?.created_at : ''
  ).format('DD.MM.YYYY hh:mm')
  const priceListUpdated = dayjs(
    pricesData ? pricesData[0]?.updated_at : ''
  ).format('DD.MM.YYYY hh:mm')

  const pricesValues = useMemo(() => {
    return (
      map(
        prices,
        ({
          id,
          character_fee,
          word_fee,
          page_fee,
          minute_fee,
          hour_fee,
          minimal_fee,
          skill_id,
          source_language_classifier_value,
          destination_language_classifier_value,
        }) => {
          return {
            id: id,
            character_fee: character_fee,
            word_fee: word_fee,
            page_fee: page_fee,
            minute_fee: minute_fee,
            hour_fee: hour_fee,
            minimal_fee: minimal_fee,
            skill_id: get(skillsData, [
              findIndex(skillsData, { id: skill_id }),
              'name',
            ]),
            language_direction: `${source_language_classifier_value.name} > ${destination_language_classifier_value.name}`,
          }
        }
      ) || {}
    )
  }, [skillsData, prices])

  const { handleSubmit, control, reset, setValue } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: {},
  })

  const resetForm = useCallback(() => {
    reset()
  }, [reset])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const languageOptions = map(languageFilter, ({ value, label }) => {
    return {
      label: label,
      value: value,
    }
  })

  const languagePairFormFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'src_lang_classifier_value_id',
      ariaLabel: t('vendors.source_language'),
      label: `${t('vendors.source_language')}*`,
      placeholder: t('button.choose'),
      options: languageOptions,
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
      options: languageOptions,
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
      }
    }
  )

  const onEditPricesSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      console.log('VALUES', values)

      const priceValue = values.priceObject

      const payload = {
        data: [priceValue],
      }

      console.log('payload', payload)

      try {
        // await updatePrices(payload)

        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.language_pairs_prices_added'),
        })
        resetForm()
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [resetForm, t, updatePrices]
  )

  const handleEditPriceModal = (skillRowId: string) => {
    const skillIdToNameMap = keyBy(skillsData, 'id')

    const editableSkill2 = [find(prices, { id: skillRowId })].filter(
      Boolean
    ) as PricesData[]

    const skillName = map(editableSkill2, ({ skill_id }) => {
      const skillData = skillIdToNameMap[skill_id]
      return skillData.name
    })

    const editableSkill = compact(
      map(prices, (skill) => {
        if (skill.id === skillRowId) {
          return {
            id: skill.id,
            character_fee: skill.character_fee,
            hour_fee: skill.hour_fee,
            minimal_fee: skill.minimal_fee,
            minute_fee: skill.minute_fee,
            page_fee: skill.page_fee,
            word_fee: skill.word_fee,
            skill_id: skillName[0],
          }
        }
        return null
      })
    )

    setValue('priceObject', editableSkill)

    console.log('editableSkill handle', editableSkill)

    const srcLanguageValue =
      editableSkill2[0].source_language_classifier_value.name

    const dstLanguageValues = map(
      editableSkill2,
      ({ destination_language_classifier_value }) =>
        destination_language_classifier_value.name
    )

    showModal(ModalTypes.EditableVendorPriceList, {
      submitForm: handleSubmit(onEditPricesSubmit),
      // resetForm: resetForm(),
      title: t('vendors.price_list_change'),
      helperText: t('vendors.price_list_change_description'),
      modalContent: (
        <VendorPriceListEditContent
          control={control}
          editableSkill={editableSkill}
          srcLanguageValue={srcLanguageValue}
          dstLanguageValues={dstLanguageValues}
        />
      ),
    })
  }

  const columnHelper = createColumnHelper<Prices>()

  const columns = [
    columnHelper.accessor('language_direction', {
      header: () => t('vendors.language_direction'),
      cell: (info) => {
        return <div className={classes.languageTag}>{info.renderValue()}</div>
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('skill_id', {
      header: () => t('vendors.skill'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('character_fee', {
      header: () => t('vendors.character_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('word_fee', {
      header: () => t('vendors.word_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('page_fee', {
      header: () => t('vendors.page_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minute_fee', {
      header: () => t('vendors.minute_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('hour_fee', {
      header: () => t('vendors.hour_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minimal_fee', {
      header: () => t('vendors.minimal_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('id', {
      header: () => <></>,
      cell: ({ row }) => {
        const skillRowId = row.original.id
        return (
          <div className={classes.iconsContainer}>
            <Button
              appearance={AppearanceTypes.Text}
              icon={Edit}
              ariaLabel={t('vendors.edit_language_pair')}
              className={classes.editIcon}
              onClick={() => handleEditPriceModal(skillRowId)}
            />
            <Button
              appearance={AppearanceTypes.Text}
              icon={Delete}
              ariaLabel={t('vendors.delete')}
              className={classes.deleteIcon}
              // handle delete
            />
          </div>
        )
      },
    }),
  ] as ColumnDef<any>[]

  const onAddPricesSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const transformedArray = flatMap(
        values.dst_lang_classifier_value_id,
        (dstValue) =>
          map(
            keys(pickBy(values.skill_id, (value) => value === true)),
            (key, index) => {
              return {
                vendor_id: vendor_id,
                skill_id: key.replace(/_\d+$/, ''),
                src_lang_classifier_value_id:
                  values['src_lang_classifier_value_id'],
                dst_lang_classifier_value_id: dstValue,
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
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [createPrices, resetForm, t, vendor_id]
  )

  const handleModalOpen = () => {
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
              languageOptions={languageOptions}
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
              languageOptions={languageOptions}
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
    })
  }

  const formValues = useWatch({ control })
  console.log('formValuesVendor', formValues)

  return (
    <>
      <Root>
        <DataTable
          data={pricesValues}
          columns={columns}
          tableSize={TableSizeTypes.M}
          className={
            !isEmpty(pricesValues)
              ? classes.vendorPricesContainer
              : classes.hiddenVendorPrices
          }
          title={
            <div className={classes.pricesDataTableHeader}>
              {t('vendors.vendor_price_list_title')}
              <Button
                appearance={AppearanceTypes.Text}
                icon={AddIcon}
                iconPositioning={IconPositioningTypes.Left}
                onClick={handleModalOpen}
                className={classes.pricesLanguageButton}
              >
                {t('vendors.add_language_directions')}
              </Button>
            </div>
          }
        />
      </Root>

      <p className={classes.dateText}>
        {t('vendors.price_list_created', { priceListCreated })}
      </p>
      <p className={classes.dateText}>
        {t('vendors.price_list_updated_at', { priceListUpdated })}
      </p>
    </>
  )
}

export default VendorPriceListForm
