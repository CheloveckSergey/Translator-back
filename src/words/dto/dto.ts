import { WordStatus } from "../user-word.entity";

export type StringSpanDto = WordSpanDto | ConnectionDto;

export interface WordSpanDto {
  type: 'word',
  value: string,
  status: WordStatus | 'never',
}

export interface ConnectionDto {
  type: 'connection',
  value: string,
}



export interface TransWordDto {
  value: string,
  translation: string,
}



export interface TransStatusWordDto {
  type: 'word',
  value: string,
  translation: string,
  status: WordStatus | 'never',
}



export interface TodayWordDto {
  value: string,
  translation: string,
}



export interface WholeWordDto {
  value: string,
  status: WordStatus,
  translation: string,
  createDate: Date,
  updateDate: Date,
  quantity: number,
}