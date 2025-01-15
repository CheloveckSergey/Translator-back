import { StringSpanDto, TransWordDto } from "src/words/dto/dto";

export interface TextSpanDto {
  id: number,
  name: string,
  stringSpans: StringSpanDto[], 
  translation: string | undefined,
}

export type TranslationDto = TransTextDto | TransWordDto;

export interface TransTextDto {
  type: 'text',
  value: string,
  translation: string,
}

export interface TextPreviewDto {
  id: number,
  name: string,
  content: string,
  author: {
    id: number,
    login: string,
  },
  createDate: Date,
  updateDate: Date,
  isCopied?: boolean,
}

export interface ShortTextPreviewDto {
  id: number,
  name: string,
  author: {
    id: number,
    login: string,
  },
  createDate: string,
}

export interface TextSchema {
  id: number,
  name: string,
  content: string,
  author: {
    id: number,
    login: string,
  }
  createDate: Date,
  updateDate: Date,
  isCopied?: boolean,
}