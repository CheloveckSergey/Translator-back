export interface TextPreviewsQuery {
  limit?: number,
  offset?: number,
  order?: 'ASC' | 'DESC',
  userId: number,
}