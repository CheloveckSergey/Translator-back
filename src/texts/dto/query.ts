import { UsualQuery } from "src/shared/types";
import { TextSchema } from "./dto";

export interface TextPreviewsQuery extends UsualQuery {
  userId: number,
}

export interface TextsInfoQuery {
  userId: number,
}

export interface TextPreviewsQuery extends UsualQuery {
  userId: number,
}

export interface AllTextPreviewsQuery extends UsualQuery {}

export interface TextQuery {
  textId: number,
  page: number,
}