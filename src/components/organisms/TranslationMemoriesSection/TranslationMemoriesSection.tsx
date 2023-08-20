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

interface TranslationMemoryButtonProps {
  hidden?: boolean
}

const TranslationMemoryButtons: FC<TranslationMemoryButtonProps> = ({
  hidden,
}) => {
  const { t } = useTranslation()
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
        // onClick={addNewTm}
      />
    </>
  )
}

interface TranslationMemoriesSectionProps<TFormValues extends FieldValues> {
  className?: string
  hidden?: boolean
  isEditable?: boolean
  control?: Control<TFormValues>
}

interface FileRow {
  language_direction: string
  name: string
  main_write: string
  chunk_amount: number
  delete_button: number
}

const columnHelper = createColumnHelper<FileRow>()

const TranslationMemoriesSection = <TFormValues extends FieldValues>({
  className,
  hidden,
  isEditable,
  control,
}: TranslationMemoriesSectionProps<TFormValues>) => {
  const { t } = useTranslation()

  // TODO: we need to map translation memories here for table data
  const filesData = useMemo(
    () => [
      {
        language_direction: 'et > en',
        name: 'Some name',
        main_write: 'translationMemoryId1',
        chunk_amount: 12345,
        delete_button: 0,
      },
    ],
    []
  )

  const handleDelete = useCallback((index?: number) => {
    // TODO: delete translation memory
  }, [])

  const columns = [
    columnHelper.accessor('language_direction', {
      header: () => t('label.language_direction'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return <Tag label={getValue()} value />
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
      cell: ({ getValue }) => {
        // TODO: isAllowedToWrite should come from translation memories in some format
        const isAllowedToWrite = true
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
            name={`write_to_memory.${getValue()}` as Path<TFormValues>}
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
            onClick={() => handleDelete(getValue())}
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
      rightComponent={<TranslationMemoryButtons hidden={!isEditable} />}
      initialIsExpanded={isEditable}
      wrapContent
      leftComponent={
        <h3>{t('translation_memory.chosen_translation_memories')}</h3>
      }
    >
      <DataTable
        data={filesData}
        columns={columns}
        tableSize={TableSizeTypes.M}
        className={classes.translationMemoriesTable}
        hidePagination
      />
    </ExpandableContentContainer>
  )
}

export default TranslationMemoriesSection
