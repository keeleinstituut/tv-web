import { useCallback, useMemo, FC } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import {
  InputTypes,
  FormInput,
} from 'components/organisms/DynamicForm/DynamicForm'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { Control, FieldValues, Path } from 'react-hook-form'
import classNames from 'classnames'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import Tag from 'components/atoms/Tag/Tag'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'
import { showModal, ModalTypes, closeModal } from '../modals/ModalRoot'
import {
  useFetchTranslationMemories,
  useUpdateSubOrderTmKeys,
} from 'hooks/requests/useTranslationMemories'
import { SubOrderTmKeys } from 'types/translationMemories'
import { map, includes, filter, find, isEqual, pull } from 'lodash'
import useAuth from 'hooks/useAuth'

import { showValidationErrorMessage } from 'api/errorHandler'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from '../NotificationRoot/NotificationRoot'
interface TranslationMemoryButtonProps {
  hidden?: boolean
  subOrderId?: string
}

const TranslationMemoryButtons: FC<TranslationMemoryButtonProps> = ({
  hidden,
  subOrderId,
}) => {
  const { t } = useTranslation()

  const addNewTm = () => {
    showModal(ModalTypes.AddTranslationMemories, {
      subOrderId: subOrderId,
    })
  }

  if (hidden) return null
  return (
    <>
      <Button
        appearance={AppearanceTypes.Secondary}
        size={SizeTypes.S}
        // onClick={createEmptyTm}
        children={t('button.create_empty_tm')}
      />
      <Button
        children={t('button.add_tm')}
        size={SizeTypes.S}
        className={classes.mainButton}
        onClick={addNewTm}
      />
    </>
  )
}

interface TranslationMemoriesSectionProps<TFormValues extends FieldValues> {
  className?: string
  hidden?: boolean
  isEditable?: boolean
  control?: Control<TFormValues>
  subOrderId?: string
  subOrderTmKeys?: SubOrderTmKeys[]
  subOrderLangPair?: string
}

interface FileRow {
  language_direction?: string
  name?: string
  main_write?: boolean
  chunk_amount?: number | string
  delete_button?: string
  id?: string
  institution_id?: string
}

const columnHelper = createColumnHelper<FileRow>()

const TranslationMemoriesSection = <TFormValues extends FieldValues>({
  className,
  hidden,
  isEditable,
  control,
  subOrderId,
  subOrderTmKeys,
  subOrderLangPair,
}: TranslationMemoriesSectionProps<TFormValues>) => {
  const { t } = useTranslation()
  const { translationMemories = [] } = useFetchTranslationMemories()
  const { updateSubOrderTmKeys } = useUpdateSubOrderTmKeys()
  const { userInfo } = useAuth()
  const { selectedInstitution } = userInfo?.tolkevarav || {}

  const tmIds = map(subOrderTmKeys, 'key')
  const filteredData = filter(translationMemories, ({ id }) =>
    includes(tmIds, id)
  )

  const selectedTMs = useMemo(
    () =>
      map(filteredData, (tm, key) => {
        return {
          id: tm.id,
          language_direction: tm?.lang_pair,
          name: tm?.name,
          main_write: find(subOrderTmKeys, { key: tm.id })?.is_writable,
          chunk_amount: tm?.chunk_amount || 123,
          delete_button: tm?.id,
          institution_id: tm?.institution_id,
        }
      }),

    [filteredData, subOrderTmKeys]
  )

  const handleDelete = useCallback(
    async (id?: string, tmKeys?: string[]) => {
      const array = tmKeys || []
      const notDeletedTmsKeys = pull(array, id)

      const payload = {
        sub_project_id: subOrderId || '',
        tm_keys: map(notDeletedTmsKeys, (key) => {
          return {
            key: key || '',
            is_writable: true,
          }
        }),
      }
      try {
        await updateSubOrderTmKeys(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.translation_memories_created'),
        })
        closeModal()
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [subOrderId, t, updateSubOrderTmKeys]
  )

  const columns = [
    columnHelper.accessor('language_direction', {
      header: () => t('label.language_direction'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return <Tag label={getValue() || ''} value />
      },
    }),
    columnHelper.accessor('name', {
      header: () => t('label.file_name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('main_write', {
      header: () => (
        <>
          <span>{t('label.main_write')}</span>
          <SmallTooltip
            tooltipContent={t('tooltip.main_write_helper')}
            className={classes.headerTooltip}
          />
        </>
      ),
      footer: (info) => info.column.id,
      cell: ({ row }) => {
        const isAllowedToWrite =
          selectedInstitution?.id === row?.original?.institution_id &&
          isEqual(subOrderLangPair, row?.original?.language_direction)

        if (!isAllowedToWrite) {
          return (
            <SmallTooltip
              tooltipContent={t('tooltip.owned_by_other_company')}
              className={classes.errorTooltip}
            />
          )
        }
        return (
          <FormInput
            name={`write_to_memory.${row.original.id}` as Path<TFormValues>}
            ariaLabel={t('label.main_write')}
            control={control}
            inputType={InputTypes.Checkbox}
          />
        )
      },
    }),
    columnHelper.accessor('chunk_amount', {
      header: () => t('label.chunk_amount'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('delete_button', {
      header: '',
      cell: ({ getValue }) => {
        return (
          <BaseButton
            className={classes.iconButton}
            onClick={() => handleDelete(getValue(), tmIds)}
          >
            <Delete />
          </BaseButton>
        )
      },
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<FileRow>[]

  if (hidden) return null

  return (
    <ExpandableContentContainer
      className={classNames(classes.expandableContainer, className)}
      rightComponent={
        <TranslationMemoryButtons
          hidden={!isEditable}
          subOrderId={subOrderId}
        />
      }
      initialIsExpanded={isEditable}
      wrapContent
      leftComponent={
        <h3>{t('translation_memory.chosen_translation_memories')}</h3>
      }
    >
      <DataTable
        data={selectedTMs}
        columns={columns}
        tableSize={TableSizeTypes.M}
        className={classes.translationMemoriesTable}
        hidePagination
      />
    </ExpandableContentContainer>
  )
}

export default TranslationMemoriesSection
