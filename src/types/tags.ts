export enum TagTypes {
  TranslationMemories = 'Tõlkemälud',
  Vendor = 'Teostaja',
  Project = 'Tellimus',
  Skills = 'Oskused',
}

export interface TagsResponse {
  data: Tag[]
}

export interface TagsPayload {
  tags: Partial<Tag>[]
}

export interface Tag {
  id: string
  institution_id: null
  name: string
  type: TagTypes
  created_at: string
  updated_at: string
}
