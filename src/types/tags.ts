export enum TagTypes {
  Tolkemalud = 'Tõlkemälud',
  Teostaja = 'Teostaja',
  Tellimus = 'Tellimus',
  Oskused = 'Oskused',
}

export interface TagsResponse {
  data: Tag[]
}

export type GetTagsPayload = Partial<Tag>
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
