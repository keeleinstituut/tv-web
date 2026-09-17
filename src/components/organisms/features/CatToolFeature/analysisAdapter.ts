import { VolumeAnalysisBands } from 'types/assignments'
import { CattoAnalysis, JobAnalysisEntry } from './types'
import { map } from 'lodash'

export const mapCattoAnalysisToVolumeAnalysis = (
  analysis: CattoAnalysis,
): VolumeAnalysisBands => {
  const bands = analysis.bands
  return {
    raw_word_count: analysis.total.words ?? 0,
    total: analysis.total.words ?? 0,
    repetitions: bands?.repetitions.words ?? 0,
    tm_101: bands?.ice.words ?? 0,
    tm_100: bands?.exact.words ?? 0,
    tm_95_99: bands?.high_fuzzy.words ?? 0,
    tm_85_94: bands?.medium_fuzzy.words ?? 0,
    tm_75_84: bands?.low_fuzzy.words ?? 0,
    tm_50_74: bands?.slight_fuzzy.words ?? 0,
    tm_0_49: bands?.no_match.words ?? 0,
    files_names: map(analysis.job_analyses, 'job.source_file.file_name'),
  }
}
