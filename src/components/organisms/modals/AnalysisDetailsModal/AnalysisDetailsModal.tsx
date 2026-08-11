import AnalysisBandsTable, {
  buildBandRows,
  computeBandPercent,
} from "components/organisms/features/CatToolFeature/AnalysisBandsTable"
import { useCatAnalysis } from "components/organisms/features/CatToolFeature/useCatAnalysis"
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from "components/organisms/ModalBase/ModalBase"
import Button, { AppearanceTypes } from "components/molecules/Button/Button"
import ToggleTabs from "components/molecules/ToggleTabs/ToggleTabs"
import Loader from "components/atoms/Loader/Loader"
import DownloadIcon from "assets/icons/download.svg?react"
import DoneIcon from "assets/icons/success.svg?react"
import { downloadFile } from "helpers"
import dayjs from "dayjs"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { closeModal } from "../ModalRoot"
import { ConfirmationModalBaseProps } from "../ConfirmationModalBase/ConfirmationModalBase"
import classes from "./classes.module.scss"

export type AnalysisDetailsModalProps = {
  analysisId: string
  catProjectId?: string
} & ConfirmationModalBaseProps

const escapeCsvValue = (value: string | number): string => {
  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

const toCsv = (rows: (string | number)[][]): string =>
  rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n')

const AnalysisDetailsModal: FC<AnalysisDetailsModalProps> = ({
  isModalOpen,
  analysisId,
}) => {
  const { t } = useTranslation()
  const { analysis, isLoading } = useCatAnalysis(analysisId)
  const [activeTab, setActiveTab] = useState('summary')

  const rowLabels = {
    total: t('cat_tool_feature.analysis_details_modal.row.total'),
    repetitions: t('cat_tool_feature.analyses_table.band.repetitions'),
  }

  const finishedFilesCount = analysis?.job_analyses.filter(
    (jobAnalysis) => jobAnalysis.results
  ).length

  const tabs = useMemo(() => {
    if (!analysis) return []
    return [
      {
        id: 'summary',
        label: t('cat_tool_feature.analysis_details_modal.tab.summary', {
          count: analysis.job_analyses.length,
        }),
      },
      ...analysis.job_analyses.map((jobAnalysis) => {
        const isDone = !!jobAnalysis.results
        return {
          id: jobAnalysis.job_id,
          label: (
            <span className={classes.tabLabel}>
              {jobAnalysis.job?.source_file?.file_name}
              {isDone ? (
                <DoneIcon
                  className={classes.tabStatusDone}
                  aria-label={t('cat_tool_feature.analyses_table.status_done')}
                />
              ) : (
                <Loader loading className={classes.tabStatusPendingLoader} />
              )}
            </span>
          ),
        }
      }),
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis])

  const activeJobAnalysis = analysis?.job_analyses.find(
    (jobAnalysis) => jobAnalysis.job_id === activeTab
  )
  const activeResults = activeTab === 'summary' ? analysis : activeJobAnalysis?.results

  const handleDownloadCsv = () => {
    if (!analysis) return
    const header = [
      t('cat_tool_feature.analysis_details_modal.column.file'),
      t('cat_tool_feature.analysis_details_modal.column.match_type'),
      t('cat_tool_feature.analysis_details_modal.column.segments'),
      t('cat_tool_feature.analysis_details_modal.column.pages'),
      t('cat_tool_feature.analysis_details_modal.column.words'),
      t('cat_tool_feature.analysis_details_modal.column.characters'),
      t('cat_tool_feature.analysis_details_modal.column.percent'),
    ]

    const sections: { fileLabel: string; bands: typeof analysis.bands; total: typeof analysis.total }[] = [
      {
        fileLabel: t('cat_tool_feature.analysis_details_modal.tab.summary_csv'),
        bands: analysis.bands,
        total: analysis.total,
      },
      ...analysis.job_analyses
        .filter((jobAnalysis) => jobAnalysis.results)
        .map((jobAnalysis) => ({
          fileLabel: jobAnalysis.job!.source_file!.file_name,
          bands: jobAnalysis.results!.bands,
          total: jobAnalysis.results!.total,
        })),
    ]

    const rows = sections.flatMap(({ fileLabel, bands, total }) =>
      buildBandRows(bands, total, rowLabels).map((row) => [
        fileLabel,
        row.label,
        row.stats.segments,
        row.stats.pages,
        row.stats.words,
        row.stats.chars,
        `${computeBandPercent(row, total).toFixed(1)}%`,
      ])
    )

    downloadFile({
      data: toCsv([header, ...rows]),
      fileName: `analysis-${analysis.id}.csv`,
    })
  }

  return (
    <ModalBase
      title={t('cat_tool_feature.analysis_details_modal.title')}
      helperText={t('cat_tool_feature.analysis_details_modal.subtitle')}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      innerWrapperClassName={classes.modalContent}
      buttonsPosition={ButtonPositionTypes.Right}
      size={ModalSizeTypes.ExtraLarge}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          onClick: () => closeModal(),
          children: t('button.close'),
        },
      ]}
    >
      <Loader loading={isLoading && !analysis} />
      {analysis && (
        <>
          <div className={classes.metaRow}>
            <div className={classes.metaInfo}>
              <span>
                <span className={classes.metaLabel}>
                  {t('cat_tool_feature.analysis_details_modal.info.started')}:
                </span>{' '}
                {dayjs(analysis.created_at).format('DD.MM.YYYY HH:mm')}
              </span>
              <span>
                <span className={classes.metaLabel}>
                  {t('cat_tool_feature.analysis_details_modal.info.tm_used')}:
                </span>{' '}
                {t('cat_tool_feature.analysis_details_modal.info.tm_count', {
                  count: analysis.translation_memories.length,
                })}
              </span>
              <span>
                <span className={classes.metaLabel}>
                  {t('cat_tool_feature.analysis_details_modal.info.progress')}:
                </span>{' '}
                {t(
                  'cat_tool_feature.analysis_details_modal.info.files_progress',
                  {
                    done: finishedFilesCount,
                    total: analysis.job_analyses.length,
                  }
                )}
              </span>
            </div>
            <Button
              appearance={AppearanceTypes.Secondary}
              icon={DownloadIcon}
              onClick={handleDownloadCsv}
            >
              {t('cat_tool_feature.analysis_details_modal.download_csv')}
            </Button>
          </div>
          <ToggleTabs
            className={classes.tabsRow}
            name="analysis-details-tabs"
            tabs={tabs}
            value={activeTab}
            onChange={setActiveTab}
          />
          {activeResults ? (
            <AnalysisBandsTable bands={activeResults.bands} total={activeResults.total} />
          ) : (
            <p className={classes.pendingText}>
              {t('cat_tool_feature.analyses_table.status_pending')}
            </p>
          )}
        </>
      )}
    </ModalBase>
  )
}

export default AnalysisDetailsModal
