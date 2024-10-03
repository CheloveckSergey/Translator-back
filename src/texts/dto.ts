import { StringSpanDto, TransWordDto } from "src/words/dto";

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