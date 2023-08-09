import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'
import { Root } from '@radix-ui/react-form'
import { useFetchSkills, useFetchVendorPrices } from 'hooks/requests/useVendors'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { ReactComponent as AddIcon } from 'assets/icons/add.svg'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useForm } from 'react-hook-form'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'

import classes from './classes.module.scss'

type SkillsFormValue = {
  [key in string]?: string
}
interface FormValues {
  primal_language: string
  target_language: string[]
  skills: SkillsFormValue
}

export type Skill = {
  id?: string
  name?: string
}

export type Prices = {
  id: string
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  skill: Skill
}

const VendorPriceListForm: FC = () => {
  const { t } = useTranslation()

  const { data: skillsData } = useFetchSkills()
  const { data: vendorPricesData } = useFetchVendorPrices()

  console.log('vendorPricesData*************', vendorPricesData)

  const { control, handleSubmit } = useForm<FormValues>({
    reValidateMode: 'onChange',
    // defaultValues: { deactivation_date: today },
  })

  const languagePairFormFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'primal_language',
      ariaLabel: t('vendors.primal_language'),
      label: t('vendors.primal_language'),
      placeholder: t('button.choose'),
      options: [
        { label: 'Eesti ee-ET', value: 'Eesti ee-ET' },
        { label: 'Vene ru-RU', value: 'Vene ru-RU' },
        { label: 'Inglise en-GB', value: 'Inglise en-GB' },
      ],
      // rules: {
      //   required: true,
      // },
      usePortal: true,
      className: classes.languagePairSelection,
    },
    {
      inputType: InputTypes.Selections,
      name: 'target_language',
      ariaLabel: t('vendors.target_language'),
      label: t('vendors.target_language'),
      placeholder: t('button.choose'),
      options: [
        { label: 'Eesti ee-ET', value: 'Eesti ee-ET' },
        { label: 'Vene ru-RU', value: 'Vene ru-RU' },
        { label: 'Inglise en-GB', value: 'Inglise en-GB' },
      ],
      multiple: true,
      buttons: true,
      // rules: {
      //   required: true,
      // },
      usePortal: true,
      className: classes.languagePairSelection,
    },
  ]

  const skillsFormFields: FieldProps<FormValues>[] = map(
    skillsData,
    ({ id, name }) => ({
      key: id,
      inputType: InputTypes.Checkbox,
      ariaLabel: name || '',
      label: name,
      name: `skills.${name}`,
      // rules: {
      //   required: true,
      // },
      className: classes.skillsField,
    })
  )

  const prices = [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      vendor_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      skill_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      src_lang_classifier_value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      dst_lang_classifier_Value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      updated_at: '2023-08-09T07:48:41.163Z',
      created_at: '2023-08-09T07:48:41.163Z',
      character_fee: 0,
      word_fee: 0,
      page_fee: 0,
      minute_fee: 0,
      hour_fee: 0,
      minimal_fee: 0,
      vendor: 'string',
      source_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        type: 'string',
        value: 'string',
        name: 'string',
      },
      destination_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        type: 'string',
        value: 'string',
        name: 'string',
      },
      skill: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'Tõlkimine + toimetamine',
      },
    },
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      vendor_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      skill_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      src_lang_classifier_value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      dst_lang_classifier_Value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
      updated_at: '2023-08-09T07:48:41.163Z',
      created_at: '2023-08-09T07:48:41.163Z',
      character_fee: 0,
      word_fee: 0,
      page_fee: 0,
      minute_fee: 0,
      hour_fee: 0,
      minimal_fee: 0,
      vendor: 'string',
      source_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
        type: 'string',
        value: 'string',
        name: 'string',
      },
      destination_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
        type: 'string',
        value: 'string',
        name: 'string',
      },
      skill: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
        name: 'Terminoloogia töö',
      },
    },
  ]

  const pricesData = useMemo(() => {
    return (
      map(prices, (data) => {
        return {
          id: data.id,
          character_fee: data.character_fee,
          word_fee: data.word_fee,
          page_fee: data.page_fee,
          minute_fee: data.minimal_fee,
          hour_fee: data.hour_fee,
          minimal_fee: data.minimal_fee,
          skill: data.skill.name,
        }
      }) || {}
    )
  }, [])

  console.log('pricesData********', pricesData)

  const columnHelper = createColumnHelper<Prices>()

  const columns = [
    columnHelper.accessor('skill', {
      header: () => 'Oskus',
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('character_fee', {
      header: () => 'Tähemärk',
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('word_fee', {
      header: () => 'Sõna',
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('page_fee', {
      header: () => 'Lehekülg',
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minute_fee', {
      header: () => 'Minut',
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('hour_fee', {
      header: () => 'Tund',
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minimal_fee', {
      header: () => 'Min tasu',
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<any>[]

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
            <>
              <p className={classes.primalLanguage}>
                {t('vendors.primal_language')}
              </p>
              <p className={classes.targetLanguage}>
                {t('vendors.target_language')}
              </p>
              <DynamicForm
                fields={skillsFormFields}
                control={control}
                className={classes.skillsDynamicForm}
              />
            </>
          ),
        },
        {
          label: t('vendors.add_price_list'),
          title: t('vendors.set_price_list'),
          helperText: t('vendors.price_list_helper_text'),
          modalContent: (
            <>
              <p className={classes.primalLanguage}>
                {t('vendors.primal_language')}
              </p>
              <p className={classes.targetLanguage}>
                {t('vendors.target_language')}
              </p>
              <Root>
                <DataTable
                  data={pricesData}
                  columns={columns}
                  tableSize={TableSizeTypes.M}
                  hidePagination
                  title={
                    <div className={classes.pricesTitleContainer}>
                      <h4 className={classes.pricesTitle}>
                        {t('vendors.prices')}
                      </h4>
                      <span className={classes.currency}>
                        {t('vendors.eur')}
                      </span>
                    </div>
                  }
                  className={classes.vendorPriceListContainer}
                />
              </Root>
            </>
          ),
        },
      ],
    })
  }

  return (
    <Root>
      <DataTable
        data={[]}
        columns={[]}
        tableSize={TableSizeTypes.L}
        hidePagination
        title={t('vendors.user_price_list_title')}
        headComponent={
          <Button
            appearance={AppearanceTypes.Text}
            icon={AddIcon}
            iconPositioning={IconPositioningTypes.Left}
            onClick={handleModalOpen}
          >
            {t('vendors.add_language_directions')}
          </Button>
        }
      />
    </Root>
  )
}

export default VendorPriceListForm
