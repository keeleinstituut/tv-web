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

export interface CattoAnalysis {
  id: string
  job_id: string
  languages: { source: string; target: string }
  results: CattoAnalysisResults | null
  created_at: string
  updated_at: string
}

export interface CattoAnalysesResponse {
  data: CattoAnalysis[]
  meta?: ResponseMetaTypes
}
