import { useCallback, useMemo, FC } from 'react'
import { useTranslation } from 'react-i18next'
import { map, join, initial, split, isEmpty } from 'lodash'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import { ReactComponent as HorizontalDots } from 'assets/icons/horizontal_dots.svg'
import classNames from 'classnames'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'
import { CatAnalysis, CatJob, SourceFile } from 'types/orders'

import classes from './classes.module.scss'
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

interface CatJobsTableProps {
  className?: string
  hidden?: boolean
  cat_jobs?: CatJob[]
  cat_analyzis?: CatAnalysis[]
  source_files?: SourceFile[]
  source_language_classifier_value: LanguageClassifierValue
  destination_language_classifier_value: LanguageClassifierValue
}

interface CatJobRow {
  chunk_id: string
  percentage: string
  translate_url: string
  dots_button: number
}

const columnHelper = createColumnHelper<CatJobRow>()

const CatJobsTable: FC<CatJobsTableProps> = ({
  className,
  hidden,
  cat_jobs,
  cat_analyzis,
  source_files,
  source_language_classifier_value,
  destination_language_classifier_value,
}) => {
  const { t } = useTranslation()

  const handleOpenCatAnalysisModal = useCallback(() => {
    showModal(ModalTypes.CatAnalysis, {
      cat_analyzis,
      source_files,
      source_language_classifier_value,
      destination_language_classifier_value,
    })
  }, [
    cat_analyzis,
    destination_language_classifier_value,
    source_files,
    source_language_classifier_value,
  ])

  const filesData = useMemo(
    () =>
      map(
        cat_jobs,
        ({ xliff_download_url, translate_url, chunk_id }, index) => {
          // const name = xliff_download_url
          //   .substring(xliff_download_url.lastIndexOf('/' + 1))
          //   .replace('/', '')
          // TODO: currently randomly assuming that cat_jobs will have chunk_id, which will match cat_analyzis
          return {
            chunk_id,
            percentage: '50%',
            translate_url,
            dots_button: index,
          }
        }
      ),
    [cat_jobs]
  )

  const handleMerge = useCallback((chunk_id?: string) => {
    // TODO: call some merge endpoint
    console.warn('PROCEED merging files')
  }, [])

  const handleCatMergeClick = useCallback(
    (chunk_id?: string) => {
      // TODO: not sure how to check for this
      // Currently it seems that we should
      // 1. Create an array of all cat_jobs that had the same source chunk
      // 2. Check whether any of the other tabs that (that are catSupported?) have any of these files selected
      // in their "xliff" tab for sending to vendors ?
      // 3. If they are, then we need to check if any of these sub tasks have been sent to vendors
      // Possibly there will be a check against BE instead
      // If it's just a check against BE, then we might move this logic inside the modal
      const areSplitFilesSentToVendors = true
      if (areSplitFilesSentToVendors) {
        showNotification({
          type: NotificationTypes.Error,
          title: t('notification.error'),
          content: t('error.cant_merge_files'),
        })
      } else {
        showModal(ModalTypes.CatMerge, {
          handleMerge: () => handleMerge(chunk_id),
        })
      }
    },
    [handleMerge, t]
  )

  // TODO: not sure how to show this currently
  // This will mean loading state only when none of the files have been analyzed
  // 1. We need to add some refetching logic for this
  // 2. If the items start appearing 1 at a time to cat_analyzis, then this check won't work
  // 3. IT also might not work, if we split or merge cat_jobs (The previous array will exist)
  // 4. If they do appear 1 at a time, should we already show the table ? (size(cat_analyzis) < size(cat_jobs))
  const isCatAnalysisInProgress = isEmpty(cat_analyzis)

  const columns = [
    columnHelper.accessor('chunk_id', {
      header: () => t('label.xliff_name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('percentage', {
      header: () => t('label.chunks'),
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
            target="_blank"
          >
            {t('button.open_in_translation_tool')}
          </Button>
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('dots_button', {
      header: '',
      cell: ({ getValue }) => {
        const { xliff_download_url, translation_download_url, chunk_id } =
          cat_jobs?.[getValue()] || {}
        // TODO: continue from here, need to add actual functionality to these buttons
        return (
          <SimpleDropdown
            icon={HorizontalDots}
            className={classes.dropdown}
            buttonClassName={classes.dropdownInnerButton}
            options={[
              {
                label: t('button.split_file'),
                onClick: () => {
                  showModal(ModalTypes.CatSplit, {
                    chunk_id,
                  })
                },
              },
              {
                label: t('button.download_xliff'),
                href: xliff_download_url,
                download: `${join(initial(split(xliff_download_url, '.')))}`,
                target: '_blank',
              },
              {
                label: t('button.download_ready_translation'),
                href: translation_download_url,
                download: `${join(
                  initial(split(translation_download_url, '.'))
                )}`,
                target: '_blank',
              },
              {
                label: t('button.join_files'),
                onClick: () => {
                  handleCatMergeClick(chunk_id)
                },
              },
            ]}
          />
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
            <h3>{t('orders.source_files_in_translation_tool')}</h3>

            <SmallTooltip
              tooltipContent={t(
                'tooltip.source_files_in_translation_tool_helper'
              )}
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
      >
        {t('button.look_at_cat_analysis')}
      </Button>
    </div>
  )
}

export default CatJobsTable
