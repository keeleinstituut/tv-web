export enum TagTypes {
  TranslationMemories = 'Tõlkemälud',
  Vendor = 'Teostaja',
  Order = 'Tellimus',
  Skills = 'Oskused',
}
export interface TagsResponse {
  data: Tag[]
}

export type GetTagsPayload = Partial<Tag>
export interface TagsPayload {
  type?: TagTypes
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
