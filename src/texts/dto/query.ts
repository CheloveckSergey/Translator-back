import { UsualQuery } from "src/shared/types";
import { TextSchema } from "./dto";

export interface TextPreviewsQuery extends UsualQuery {
  userId: number,
}

type By = 'user' | 'friend' | 'title';

interface BaseByOptions {
  by: By,
}

interface ByUser {
  by: 'user',
  userId: number,
}

interface ByFriends {
  by: 'friends',
  userId: number,
}

interface ByTitle {
  by: 'title',
  title: string,
}

type ByOptions = ByUser | ByFriends | ByTitle;

interface FieldsOptions<K extends keyof TextSchema> {
  fields: K[],
}

export type TextsQuery<K extends keyof TextSchema> = ByOptions & UsualQuery & FieldsOptions<K>