import { TodayWordDto, TransWordDto, WholeWordDto } from "./dto";
import { UserWord } from "./user-word.entity";
import { Word } from "./word.entity";

export function mapTranslationWordDto(word: Word): TransWordDto {
  if (!word?.translation.value) {
    throw Error("MAP_TRANSLATION_WORD_DTO")
  }

  const translationWordDto: TransWordDto = {
    value: word.value,
    translation: word.translation.value,
  }
  return translationWordDto;
}

export function mapTodayWordDto(userWord: UserWord): TodayWordDto {
  const todayWordDto: TodayWordDto = {
    value: userWord.word.value,
    translation: userWord.word.translation.value,
  }
  return todayWordDto;
}

export function mapWholeWordDto(userWord: UserWord): WholeWordDto {
  const wholeWordDto: WholeWordDto = {
    value: userWord.word.value,
    translation: userWord.word.translation.value,
    status: userWord.status,
    quantity: userWord.quantity,
    updateDate: userWord.updateDate,
    createDate: userWord.createDate,
  }
  return wholeWordDto;
}