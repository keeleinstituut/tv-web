import { ResponseMetaTypes } from "types/collective"

export interface CattoJob {
  id: string
  source_file?: { id?: string; file_name: string }
  xliff_file?: { file_name: string }
  created_at: string
}

export interface BandStats {
  segments: number
  words: number
  chars: number
  pages: number
}

export interface CattoAnalysisResults {
  bands: {
    ice: BandStats
    exact: BandStats
    repetitions: BandStats
    high_fuzzy: BandStats
    medium_fuzzy: BandStats
    low_fuzzy: BandStats
    slight_fuzzy: BandStats
    no_match: BandStats
  }
  total: BandStats
}

export interface JobAnalysisEntry {
  id: string
  job_id: string
  job?: CattoJob
  languages: { source: string; target: string }
  results: CattoAnalysisResults | null
}

export interface CattoTranslationMemoryRef {
  id: string
  name: string
  source_locale: string
  target_locale: string
}

export interface CattoAnalysis {
  id: string
  project_id: string
  translation_memories: CattoTranslationMemoryRef[]
  status: 'done' | 'pending'
  bands: CattoAnalysisResults['bands']
  total: BandStats
  job_analyses: JobAnalysisEntry[]
  created_at: string
  updated_at: string
}

export interface CattoAnalysesResponse {
  data: CattoAnalysis[]
  meta?: ResponseMetaTypes
}
