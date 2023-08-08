import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { isEmpty, includes, map, join } from 'lodash'
import { Root } from '@radix-ui/react-form'
import Loader from 'components/atoms/Loader/Loader'
import useAuth from 'hooks/useAuth'
import VendorsTable from 'components/organisms/tables/VendorsTable/VendorsTable'
import { useFetchSkills, useVendorsFetch } from 'hooks/requests/useVendors'
import { Privileges } from 'types/privileges'
import VendorManagementCheatSheet from 'components/molecules/cheatSheets/VendorManagementCheatSheet'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import classes from './classes.module.scss'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
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

type SkillsFormValue = {
  [key in string]?: string
}
interface FormValues {
  primal_language: string
  target_language: string[]
  skills: SkillsFormValue
}

export type Price = {
  id: string
  skill: {
    id: string
    name: string
  }
}[]

const VendorsDatabase: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const {
    vendors,
    paginationData,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useVendorsFetch()

  const { data } = useFetchSkills()

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
    data,
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

  const pricesData = [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      vendor_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      skill_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      src_lang_classifier_value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      dst_lang_classifier_Value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      updated_at: '2023-08-08T12:37:11.185Z',
      created_at: '2023-08-08T12:37:11.185Z',
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
        name: 'string',
      },
    },
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa2',
      vendor_id: '3fa85f64-5717-4562-b3fc-2c963f66afa2',
      skill_id: '3fa85f64-5717-4562-b3fc-2c963f66afa2',
      src_lang_classifier_value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa2',
      dst_lang_classifier_Value_id: '3fa85f64-5717-4562-b3fc-2c963f66afa2',
      updated_at: '2023-08-08T12:37:11.185Z',
      created_at: '2023-08-08T12:37:11.185Z',
      character_fee: 0,
      word_fee: 0,
      page_fee: 0,
      minute_fee: 0,
      hour_fee: 0,
      minimal_fee: 0,
      vendor: 'string',
      source_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa2',
        type: 'string',
        value: 'string',
        name: 'string',
      },
      destination_language_classifier_value: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa2',
        type: 'string',
        value: 'string',
        name: 'string',
      },
      skill: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa2',
        name: 'string',
      },
    },
  ]

  const prices = map(pricesData, ({ id, skill }) => {
    return { id, skill }
  })

  console.log('prices', prices)

  const columnHelper = createColumnHelper<Price>()

  // const columns = [
  //   columnHelper.accessor('id', {
  //     header: () => 'Isikukood',
  //     footer: (info) => info.column.id,
  //   }),
  //   columnHelper.accessor('skill', {
  //     header: () => 'Nimi',
  //     footer: (info) => info.column.id,
  //   }),
  // ] as ColumnDef<Price>[]

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
                {/* <DataTable
                  data={prices}
                  columns={columns}
                  tableSize={TableSizeTypes.M}
                  hidePagination
                  title={t('vendors.prices')}
                /> */}
              </Root>
            </>
          ),
        },
      ],
    })
  }

  return (
    <>
      <div className={classes.vendorsDatabaseHeader}>
        <h1>{t('vendors.vendors_database')}</h1>
        <Tooltip
          title={t('cheat_sheet.vendor_management.title')}
          modalContent={<VendorManagementCheatSheet />}
        />
        <Button
          href="/vendors"
          appearance={AppearanceTypes.Secondary}
          hidden={!includes(userPrivileges, Privileges.EditVendorDb)}
        >
          {t('label.add_remove_vendor')}
        </Button>
        {/* <Button
        appearance={AppearanceTypes.Secondary}
        className={classNames({
          [classes.invisible]: !includes(userPrivileges, 'EXPORT_USER'),
        })}
        onClick={handleDownloadFile}
        disabled={!includes(userPrivileges, 'EXPORT_USER')}
        loading={isLoading}
      >
        {t('button.export_csv')}
      </Button> */}
      </div>
      <Root>
        <Loader loading={isLoading && isEmpty(vendors)} />
        <VendorsTable
          data={vendors}
          hidden={isEmpty(vendors)}
          {...{
            paginationData,
            handleFilterChange,
            handleSortingChange,
            handlePaginationChange,
          }}
        />
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
    </>
  )
}

export default VendorsDatabase
