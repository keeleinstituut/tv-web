import { FC } from 'react'
import { CatAnalysis } from 'types/orders'
import { chain, map, zip, join, reduce } from 'lodash'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { ReactComponent as DownloadFilled } from 'assets/icons/download_filled.svg'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import { closeModal } from '../ModalRoot'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { LanguageClassifierValue } from 'types/classifierValues'
import Tag from 'components/atoms/Tag/Tag'

// TODO: this is WIP code for suborder view

export interface CatAnalysisModalProps {
  cat_analyzis?: CatAnalysis[]
  isModalOpen?: boolean
  source_language_classifier_value?: LanguageClassifierValue
  destination_language_classifier_value?: LanguageClassifierValue
}

enum RowKeys {
  Total = 'total',
  Tm101 = 'tm_101',
  Tmrepetitions = 'tm_repetitions',
  Tm100 = 'tm_100',
  Tm9599 = 'tm_95_99',
  Tm8594 = 'tm_85_94',
  Tm7584 = 'tm_75_84',
  Tm5074 = 'tm_50_74',
  Tm049 = 'tm_0_49',
}

interface TableRow {
  match_type: string
  [key: string]: string
}

const columnHelper = createColumnHelper<TableRow>()

const CatAnalysisModal: FC<CatAnalysisModalProps> = ({
  cat_analyzis,
  isModalOpen,
  source_language_classifier_value,
  destination_language_classifier_value,
}) => {
  const { t } = useTranslation()
  const totalWordCount = chain(cat_analyzis).map('raw_word_count').sum().value()
  const languageDirection = `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`
  const rowKeys: RowKeys[] = [
    RowKeys.Total,
    RowKeys.Tm101,
    RowKeys.Tmrepetitions,
    RowKeys.Tm100,
    RowKeys.Tm9599,
    RowKeys.Tm8594,
    RowKeys.Tm7584,
    RowKeys.Tm5074,
    RowKeys.Tm049,
  ]
  const rows = zip(
    ...map(cat_analyzis, (chunk) => [
      chunk.total,
      chunk.tm_101,
      chunk.tm_repetitions,
      chunk.tm_100,
      chunk.tm_95_99,
      chunk.tm_85_94,
      chunk.tm_75_84,
      chunk.tm_50_74,
      chunk.tm_0_49,
    ])
  )

  const keyedRows = reduce(
    rows,
    (result: unknown[], row: unknown[], index) => {
      if (!row) return result
      return [
        ...(result as object[]),
        {
          match_type: rowKeys[index],
          ...reduce(
            cat_analyzis,
            (result, { chunk_id }, innerIndex) => {
              if (!chunk_id) return result
              return {
                ...result,
                [chunk_id]: row[innerIndex],
              }
            },
            {}
          ),
        },
      ]
    },
    []
  )

  // `translation_memory.chunk.${}`
  const tableColumns = [
    columnHelper.accessor('match_type', {
      header: () => t('label.match_type'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) =>
        t(`translation_memory.chunk.${getValue() as RowKeys}`),
    }),
    ...map(cat_analyzis, ({ chunk_id }) =>
      columnHelper.accessor(chunk_id, {
        header: () =>
          t('translation_memory.cat_file_name', {
            file_name: chunk_id,
          }),
        footer: (info) => info.column.id,
      })
    ),
  ] as ColumnDef<TableRow>[]

  // TODO: no idea where this download url is suppose to come from
  const downloadUrl = 'www.ee'
  const name = downloadUrl
    .substring(downloadUrl.lastIndexOf('/' + 1))
    .replace('/', '')

  return (
    <ModalBase
      title={t('modal.analysis_title')}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      // className={classes.modalContent}
      buttonsPosition={ButtonPositionTypes.SpaceBetween}
      size={ModalSizeTypes.Small}
      buttons={[
        {
          appearance: AppearanceTypes.Text,
          children: t('button.download_analysis'),
          className: classes.linkButton,
          icon: DownloadFilled,
          size: SizeTypes.M,
          href: downloadUrl,
          target: '_blank',
          download: name,
        },
        {
          appearance: AppearanceTypes.Secondary,
          onClick: closeModal,
          children: t('button.close'),
        },
      ]}
    >
      <div className={classes.contentStyle}>
        <span className={classes.sourceFilesText}>
          {t('orders.source_files')}:{' '}
          <b>
            {join(
              map(cat_analyzis, ({ chunk_id }) => `[${chunk_id}]`),
              ', '
            )}
          </b>
        </span>
        <p className={classes.helperText}>
          {t('modal.check_analysis_help_page')}
        </p>
        <DataTable
          data={keyedRows as TableRow[]}
          columns={tableColumns}
          tableSize={TableSizeTypes.M}
          hidePagination
          headComponent={
            <div className={classes.titleRow}>
              <h3>
                {t('translation_memory.analyzed_word_count', {
                  wordCount: totalWordCount,
                })}
              </h3>

              <Tag label={languageDirection} value />
            </div>
          }
        />
      </div>
    </ModalBase>
  )
}

export default CatAnalysisModal
