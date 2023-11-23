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
  useFetchTmChunkAmounts,
  useFetchTranslationMemories,
  useToggleTmWritable,
  useUpdateSubProjectTmKeys,
} from 'hooks/requests/useTranslationMemories'
import {
  SubProjectTmKeys,
  SubProjectTmKeysPayload,
  TMType,
} from 'types/translationMemories'
import { map, includes, filter, find, isEqual, pull } from 'lodash'
import useAuth from 'hooks/useAuth'

import { showValidationErrorMessage } from 'api/errorHandler'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from '../NotificationRoot/NotificationRoot'
import { ClassifierValue } from 'types/classifierValues'
import { ProjectDetailModes } from '../ProjectDetails/ProjectDetails'
interface TranslationMemoryButtonProps {
  hidden?: boolean
  subProjectId?: string
  subProjectLangPair?: string
  projectDomain?: ClassifierValue
}

const TranslationMemoryButtons: FC<TranslationMemoryButtonProps> = ({
  hidden,
  subProjectId,
  subProjectLangPair,
  projectDomain,
}) => {
  const { t } = useTranslation()

  const addNewTm = () => {
    showModal(ModalTypes.AddTranslationMemories, {
      subProjectId: subProjectId,
      subProjectLangPair: subProjectLangPair,
      projectDomain: projectDomain,
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
  subProjectId?: string
  SubProjectTmKeys?: SubProjectTmKeys[]
  subProjectLangPair?: string
  projectDomain?: ClassifierValue
  mode?: ProjectDetailModes
}

interface FileRow {
  language_direction?: string
  name?: string
  main_write?: boolean
  chunk_amount?: number | string
  delete_button?: string
  id?: string
  institution_id?: string
  tm_key_id?: string
  type?: TMType
}

const columnHelper = createColumnHelper<FileRow>()

const TranslationMemoriesSection = <TFormValues extends FieldValues>({
  className,
  hidden,
  isEditable,
  control,
  subProjectId,
  SubProjectTmKeys,
  subProjectLangPair,
  projectDomain,
  mode,
}: TranslationMemoriesSectionProps<TFormValues>) => {
  const { t } = useTranslation()
  const { translationMemories = [] } = useFetchTranslationMemories()
  const { updateSubProjectTmKeys } = useUpdateSubProjectTmKeys()
  const { toggleTmWritable } = useToggleTmWritable()
  const { tmChunkAmounts } = useFetchTmChunkAmounts()
  const { userInfo } = useAuth()
  const { selectedInstitution } = userInfo?.tolkevarav || {}

  const tmIds = map(SubProjectTmKeys, 'key')
  const filteredData = filter(translationMemories, ({ id }) =>
    includes(tmIds, id)
  )

  const selectedTMs = useMemo(
    () =>
      map(filteredData, (tm) => {
        return {
          id: tm.id,
          language_direction: tm?.lang_pair,
          name: tm?.name,
          main_write: find(SubProjectTmKeys, { key: tm.id })?.is_writable,
          chunk_amount: tmChunkAmounts?.[tm.id] || 0,
          delete_button: tm?.id,
          institution_id: tm?.institution_id,
          tm_key_id: find(SubProjectTmKeys, { key: tm.id })?.id,
          type: tm.type,
        }
      }),

    [filteredData, SubProjectTmKeys, tmChunkAmounts]
  )

  const handleDelete = useCallback(
    async ({ id }: { id?: string }) => {
      const array = tmIds || []
      const notDeletedTmsKeys = pull(array, id)

      const payload = {
        sub_project_id: subProjectId || '',
        tm_keys: map(notDeletedTmsKeys, (key) => {
          return {
            key: key || '',
          }
        }),
      }
      try {
        await updateSubProjectTmKeys(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.translation_memory_deleted'),
        })
        closeModal()
      } catch (errorData) {
        // error message comes from api errorHandles
      }
    },
    [subProjectId, t, updateSubProjectTmKeys, tmIds]
  )

  const handleToggleTmWritable = useCallback(
    async (payload: SubProjectTmKeysPayload) => {
      try {
        await toggleTmWritable(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.translation_memory_updated'),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [t, toggleTmWritable]
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
      header: () => (isEditable ? t('label.file_name') : t('label.tag_name')),
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
      cell: ({ row, getValue }) => {
        const isAllowedToWrite =
          selectedInstitution?.id === row?.original?.institution_id &&
          isEqual(subProjectLangPair, row?.original?.language_direction)

        const key = row.original.id || ''

        const type = row.original.type || ''

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
            name={`write_to_memory.${key}` as Path<TFormValues>}
            ariaLabel={t('label.main_write')}
            control={control}
            inputType={InputTypes.Checkbox}
            disabled={mode === 'view'}
            onClick={() => {
              const payload: SubProjectTmKeysPayload = {
                id: row.original.tm_key_id || '',
                sub_project_id: subProjectId || '',
                tm_keys: [{ key }],
                is_writable: !getValue() || false,
              }
              isEqual(type, TMType.Public) && !getValue()
                ? showModal(ModalTypes.ConfirmTmWritable, {
                    payload,
                  })
                : handleToggleTmWritable(payload)
            }}
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
            onClick={() => handleDelete({ id: getValue() })}
            hidden={mode === 'view'}
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
          subProjectId={subProjectId}
          subProjectLangPair={subProjectLangPair}
          projectDomain={projectDomain}
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
