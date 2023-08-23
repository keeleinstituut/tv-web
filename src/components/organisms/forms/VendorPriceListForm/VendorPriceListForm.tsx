import { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  chain,
  flatMap,
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
import { CreatePricesPayload } from 'types/vendors'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import LanguageLabels from 'components/atoms/LanguageLabels/LanguageLabels'
import { showValidationErrorMessage } from 'api/errorHandler'
import VendorPriceListButtons from 'components/molecules/VendorPriceListButtons/VendorPriceListButtons'
import EditVendorPricesTable from 'components/organisms/tables/EditVendorPricesTable/EditVendorPricesTable'

import classes from './classes.module.scss'

export type FormValues = {
  src_lang_classifier_value_id?: string
  dst_lang_classifier_value_id?: string
  skill_id?: { [key: string]: boolean }
  priceObject?: PriceObject[]
} & {
  [key: string]: number | string | undefined
}

export type PriceObject = {
  id: string
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  skill_id: string
  language_direction?: string
  source_language_classifier_value?: {
    name: string
  }
  destination_language_classifier_value?: {
    name: string
  }
  subRows?: PriceObject[]
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

  const { id: vendor_id } = vendor

  const { createPrices, isLoading: isCreatingPrices } =
    useCreatePrices(vendor_id)

  const { updatePrices, isLoading: isUpdatingPrices } =
    useUpdatePrices(vendor_id)

  const {
    prices: pricesData,
    paginationData,
    handlePaginationChange,
  } = useFetchPrices({
    vendor_id,
  })

  const priceListCreated = dayjs(
    pricesData ? pricesData[0]?.created_at : ''
  ).format('DD.MM.YYYY hh:mm')
  const priceListUpdated = dayjs(
    pricesData ? pricesData[0]?.updated_at : ''
  ).format('DD.MM.YYYY hh:mm')

  const groupedLanguagePairData = useMemo(() => {
    return chain(pricesData)
      .groupBy(
        (item) =>
          `${item.src_lang_classifier_value_id}.${item.dst_lang_classifier_value_id}`
      )
      .map((items) => {
        return {
          language_direction: `${items[0].source_language_classifier_value.name} > ${items[0].destination_language_classifier_value.name} `,
          subRows: items,
        }
      })
      .value()
  }, [pricesData])

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
            id: id,
            character_fee: toNumber(character_fee),
            hour_fee: toNumber(hour_fee),
            minimal_fee: toNumber(minimal_fee),
            minute_fee: toNumber(minute_fee),
            page_fee: toNumber(page_fee),
            word_fee: toNumber(word_fee),
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
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [resetForm, t, updatePrices]
  )

  const handleEditPriceModal = (languagePairModalContent: PriceObject[]) => {
    const skillIds = keyBy(skillsData, 'id')

    const languagePairModalContent2 = map(
      languagePairModalContent,
      ({
        id,
        character_fee,
        hour_fee,
        minute_fee,
        minimal_fee,
        page_fee,
        word_fee,
        skill_id,
      }) => {
        return {
          id: id,
          character_fee: character_fee,
          hour_fee: hour_fee,
          minimal_fee: minimal_fee,
          minute_fee: minute_fee,
          page_fee: page_fee,
          word_fee: word_fee,
          skill_id: skillIds[skill_id].name,
        }
      }
    )

    setValue('priceObject', languagePairModalContent)

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
          editableSkill={languagePairModalContent2}
          srcLanguageValue={srcLanguageValue}
          dstLanguageValues={[dstLanguageValue]}
        />
      ),
      isLoading: isUpdatingPrices,
    })
  }

  const columnHelper = createColumnHelper<PriceObject>()

  const columns = [
    columnHelper.accessor('language_direction', {
      header: () => t('vendors.language_direction'),
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (row.getCanExpand()) {
            row.toggleExpanded(true)
          }
        }, [row])

        const languageDirection = row.original.language_direction

        return (
          <>
            {row.getCanExpand() && (
              <Button
                onClick={() => row.toggleExpanded()}
                appearance={AppearanceTypes.Text}
                hidden
              />
            )}
            <p className={languageDirection && classes.languageTag}>
              {languageDirection}
            </p>
          </>
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('skill_id', {
      header: () => t('vendors.skill'),
      cell: ({ getValue }) => {
        const skillName = skillsData?.find((skill) => skill.id === getValue())
        return <p>{skillName?.name}</p>
      },
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
        const languagePairModalContent = !row.originalSubRows
          ? [row.original]
          : row.original.subRows || []

        return (
          <div className={classes.iconsContainer}>
            <Button
              appearance={AppearanceTypes.Text}
              icon={Edit}
              ariaLabel={t('vendors.edit_language_pair')}
              className={classes.editIcon}
              onClick={() => handleEditPriceModal(languagePairModalContent)}
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

  return (
    <>
      <Root>
        <DataTable
          data={groupedLanguagePairData}
          getSubRows={(originalRow) => originalRow.subRows}
          columns={columns}
          tableSize={TableSizeTypes.M}
          className={
            !isEmpty(groupedLanguagePairData)
              ? classes.vendorPricesContainer
              : classes.hiddenVendorPrices
          }
          paginationData={paginationData}
          onPaginationChange={handlePaginationChange}
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
