import { VolumeAnalysisBands } from 'types/assignments'
import { CattoAnalysis } from './types'

export const mapCattoAnalysisToVolumeAnalysis = (
  analysis: CattoAnalysis,
  fileNames: string[] = []
): VolumeAnalysisBands => {
  const bands = analysis.results?.bands
  return {
    raw_word_count: analysis.results?.total.words ?? 0,
    total: analysis.results?.total.words ?? 0,
    repetitions: bands?.repetitions.words ?? 0,
    tm_101: bands?.ice.words ?? 0,
    tm_100: bands?.exact.words ?? 0,
    tm_95_99: bands?.high_fuzzy.words ?? 0,
    tm_85_94: bands?.medium_fuzzy.words ?? 0,
    tm_75_84: bands?.low_fuzzy.words ?? 0,
    tm_50_74: bands?.slight_fuzzy.words ?? 0,
    tm_0_49: bands?.no_match.words ?? 0,
    chunk_id: analysis.job_id,
    files_names: fileNames,
  }
}
