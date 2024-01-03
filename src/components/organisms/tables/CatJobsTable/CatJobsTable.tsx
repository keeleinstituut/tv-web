import { useCallback, useMemo, FC } from 'react'
import { useTranslation } from 'react-i18next'
import { map, round, size, toNumber } from 'lodash'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import { ReactComponent as HorizontalDots } from 'assets/icons/horizontal_dots.svg'
import classNames from 'classnames'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'
import { CatAnalysis, CatJob, SourceFile } from 'types/projects'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import SimpleDropdown from 'components/molecules/SimpleDropdown/SimpleDropdown'
import { LanguageClassifierValue } from 'types/classifierValues'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import {
  useDownloadTranslatedFile,
  useDownloadXliffFile,
} from 'hooks/requests/useProjects'

import classes from './classes.module.scss'
import { ProjectDetailModes } from 'components/organisms/ProjectDetails/ProjectDetails'

interface CatJobsTableProps {
  className?: string
  hidden?: boolean
  cat_jobs?: CatJob[]
  subProjectId: string
  cat_analyzis?: CatAnalysis[]
  cat_files?: SourceFile[]
  source_files?: SourceFile[]
  source_language_classifier_value?: LanguageClassifierValue
  destination_language_classifier_value?: LanguageClassifierValue
  canSendToVendors?: boolean
  mode?: ProjectDetailModes
  isHistoryView?: string
  isEditable?: boolean
}

interface CatJobRow {
  dots_button?: number
  id?: string | number
  name?: string
  progress_percentage?: string
  translate_url?: string
}

const columnHelper = createColumnHelper<CatJobRow>()

const CatJobsTable: FC<CatJobsTableProps> = ({
  className,
  hidden,
  cat_jobs,
  cat_analyzis,
  subProjectId,
  cat_files,
  source_files,
  source_language_classifier_value,
  destination_language_classifier_value,
  canSendToVendors,
  mode,
  isHistoryView,
  isEditable,
}) => {
  const { t } = useTranslation()
  const { downloadXliff } = useDownloadXliffFile({ isZip: size(cat_files) > 1 })
  const { downloadTranslatedFile } = useDownloadTranslatedFile({
    isZip: size(cat_files) > 1,
  })

  const handleOpenCatAnalysisModal = useCallback(() => {
    showModal(ModalTypes.CatAnalysis, {
      cat_analyzis,
      subProjectId,
      cat_files,
      source_files,
      source_language_classifier_value,
      destination_language_classifier_value,
    })
  }, [
    cat_analyzis,
    subProjectId,
    cat_files,
    destination_language_classifier_value,
    source_files,
    source_language_classifier_value,
  ])

  const filesData = useMemo(() => {
    return map(cat_jobs, ({ id, name, progress_percentage, translate_url }) => {
      return { id, name, progress_percentage, translate_url, dots_button: 0 }
    })
  }, [cat_jobs])

  const handleCatSplitClick = useCallback(() => {
    if (canSendToVendors) {
      showModal(ModalTypes.CatSplit, {
        subProjectId,
      })
    } else {
      showNotification({
        type: NotificationTypes.Error,
        title: t('notification.error'),
        content: t('error.cant_split_files'),
      })
    }
  }, [canSendToVendors, subProjectId, t])

  const handleCatMergeClick = useCallback(() => {
    if (canSendToVendors && size(cat_jobs) > 1) {
      showModal(ModalTypes.CatMerge, {
        subProjectId,
      })
    } else {
      showNotification({
        type: NotificationTypes.Error,
        title: t('notification.error'),
        content: t('error.cant_merge_files'),
      })
    }
  }, [canSendToVendors, cat_jobs, subProjectId, t])

  // TODO: not sure how to show this currently
  // This will mean loading state only when none of the files have been analyzed
  // 1. We need to add some refetching logic for this
  // 2. If the items start appearing 1 at a time to cat_analyzis, then this check won't work
  // 3. IT also might not work, if we split or merge cat_jobs (The previous array will exist)
  // 4. If they do appear 1 at a time, should we already show the table ? (size(cat_analyzis) < size(cat_jobs))
  const isCatAnalysisInProgress = false //isEmpty(cat_analyzis)

  const columns = [
    columnHelper.accessor('name', {
      header: () =>
        mode === ProjectDetailModes.View
          ? t('label.file_name')
          : t('label.xliff_name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('progress_percentage', {
      header: () => t('label.progress'),
      cell: ({ getValue }) => {
        return <span>{`${round(toNumber(getValue()))} %`}</span>
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('translate_url', {
      header: '',
      cell: ({ getValue }) => {
        return (
          <Button
            className={classes.fitContent}
            size={SizeTypes.S}
            href={getValue()}
            disabled={!isEditable || !!isHistoryView}
            target="_blank"
          >
            {t('button.open_in_translation_tool')}
          </Button>
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('dots_button', {
      cell: () => {
        return mode === ProjectDetailModes.View ? (
          <SimpleDropdown
            icon={HorizontalDots}
            disabled={!!isHistoryView}
            className={classes.dropdown}
            buttonClassName={classes.dropdownInnerButton}
            options={[
              {
                label: t('button.download_xliff'),
                onClick: () => downloadXliff(subProjectId),
              },
              {
                label: t('button.download_ready_translation'),
                onClick: () => downloadTranslatedFile(subProjectId),
              },
            ]}
          />
        ) : (
          ''
        )
      },
      header: () => {
        return mode !== ProjectDetailModes.View ? (
          <SimpleDropdown
            icon={HorizontalDots}
            className={classes.dropdown}
            buttonClassName={classes.dropdownInnerButton}
            disabled={!isEditable}
            options={[
              {
                label: t('button.split_file'),
                onClick: handleCatSplitClick,
              },
              {
                label: t('button.download_xliff'),
                onClick: () => downloadXliff(subProjectId),
              },
              {
                label: t('button.download_ready_translation'),
                onClick: () => downloadTranslatedFile(subProjectId),
              },
              {
                label: t('button.join_files'),
                onClick: handleCatMergeClick,
              },
            ]}
          />
        ) : (
          ''
        )
      },
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<CatJobRow>[]

  if (hidden) return null

  return (
    <div className={classNames(classes.container, className)}>
      <DataTable
        data={filesData}
        columns={columns}
        tableSize={TableSizeTypes.M}
        className={classes.filesListContainer}
        hidePagination
        headComponent={
          <div className={classes.titleRow}>
            <h3>
              {mode === ProjectDetailModes.View
                ? t('my_tasks.my_final_files')
                : t('projects.source_files_in_translation_tool')}
            </h3>

            <SmallTooltip
              tooltipContent={
                mode === ProjectDetailModes.View
                  ? t('tooltip.my_ready_files_from_vendors')
                  : t('tooltip.source_files_in_translation_tool_helper')
              }
            />
          </div>
        }
      />
      <Button
        appearance={AppearanceTypes.Text}
        onClick={handleOpenCatAnalysisModal}
        iconPositioning={IconPositioningTypes.Left}
        disabled={isCatAnalysisInProgress}
        className={classNames(
          classes.linkButton,
          isCatAnalysisInProgress && classes.loader
        )}
        icon={ArrowRight}
        hidden={mode === ProjectDetailModes.View}
      >
        {t('button.look_at_cat_analysis')}
      </Button>
    </div>
  )
}

export default CatJobsTable
