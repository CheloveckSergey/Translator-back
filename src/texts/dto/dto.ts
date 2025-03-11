import { StringSpanDto, TransWordDto } from "src/words/dto/dto";

export interface Block {
  id: number,
  original: StringSpanDto[],
  translation: string,
}

export interface TextSpanDto {
  id: number,
  name: string,
  blocks: Block[],
  premiere: boolean,
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
  isCopied: boolean,
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
  createDate: Date,
  updateDate: Date,
  author: {
    id: number,
    login: string,
  }
  isCopied: boolean,
}

export interface TextsInfoDto {
  generalTextsNumber: number,
  ownTextsNumber: number,
  copiedTextsNumber: number,
}

export interface CreateTextDto {
  name: string,
  userId: number,
}

// export interface CreateTextResponse = TextPre

// export interface CreateTextResponse {
//   id: number,
//   name: string,
// }

interface GeneralBlock {
  type: 'new' | 'edit' | 'delete' | 'newBlockAbove' | 'newBlockBelow',
}

interface NewBlock extends GeneralBlock {
  type: 'new',
  original: string,
  translation: string,
}

interface NewBlockAbove extends GeneralBlock {
  type: 'newBlockAbove',
  original: string,
  translation: string,
  blockId: number,
}

interface NewBlockBelow extends GeneralBlock {
  type: 'newBlockBelow',
  original: string,
  translation: string,
  blockId: number,
}

interface EditBlock extends GeneralBlock {
  type: 'edit',
  blockId: number,
  original: string,
  translation: string,
}

interface DeleteBlock extends GeneralBlock {
  type: 'delete',
  blockId: number,
}

type SaveBlock = NewBlock | EditBlock | DeleteBlock | NewBlockAbove | NewBlockBelow;

export interface SaveBlocksDto {
  textId: number,
  blocks: SaveBlock[],
}

export interface EditingBlockDto {
  id: number,
  original: string,
  translation: string,
}

export interface EditingTextSpanDto {
  id: number,
  name: string,
  blocks: EditingBlockDto[],
  pagesTotal: number,
}