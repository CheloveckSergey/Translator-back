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

type By = 'user' | 'friends' | 'title';

interface BaseByOptions {
  by: By,
}

interface ByUser extends BaseByOptions {
  by: 'user',
  userId: number,
}

interface ByFriends extends BaseByOptions {
  by: 'friends',
  userId: number,
}

interface ByTitle extends BaseByOptions {
  by: 'title',
  title: string,
}

type ByOptions = ByUser | ByFriends | ByTitle;

interface FieldsOptions<K extends keyof TextSchema> {
  fields: K[],
}

export type TextsQuery<K extends keyof TextSchema> = ByOptions & UsualQuery & FieldsOptions<K>