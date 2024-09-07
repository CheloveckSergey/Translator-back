import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Word } from './word.entity';
import { UserWord, WordStatus } from './user-word.entity';
import { TranslatorApiService } from 'src/translator-api/translator-api.service';
import { User } from 'src/users/user.entity';
import { Translation } from './translation.entity';

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



function isToday(date: Date): boolean {
  if (!date) {
    return false
  }

  const now = new Date();
  if ((now.getFullYear() === date.getFullYear()) &&
  (now.getMonth() === date.getMonth()) &&
  (now.getDate() === date.getDate()) &&
  (now.getHours() === date.getHours())) {
    return true
  } else {
    return false
  }  
}

function mapTranslationWordDto(word: Word): TransWordDto {
  const translationWordDto: TransWordDto = {
    value: word.value,
    translation: word.translation.value,
  }
  return translationWordDto;
}

function mapTodayWordDto(userWord: UserWord): TodayWordDto {
  const todayWordDto: TodayWordDto = {
    value: userWord.word.value,
    translation: userWord.word.translation.value,
  }
  return todayWordDto;
}

function mapWholeWordDto(userWord: UserWord): WholeWordDto {
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

@Injectable()
export class WordsService {

  constructor(
    @Inject('WORD_REPOSITORY') 
    private wordRepository: Repository<Word>,
    @Inject('USER_WORD_REPOSITORY') 
    private userWordRepository: Repository<UserWord>,
    @Inject('USER_REPOSITORY') 
    private userRep: Repository<User>,
    @Inject('TRANSLATION_REPOSITORY') 
    private translationRep: Repository<Translation>,
    private translatorApiService: TranslatorApiService,
  ) {}

  async getAllWords(userId: number): Promise<WholeWordDto[]> {
    const user = await this.userRep.findOneBy({ id: userId });
    const words = await this.userWordRepository.find({
      where: {
        user,
      },
      relations: {
        word: {
          translation: true,
        },
      }
    });
    const translationWordDtos = words.map(word => mapWholeWordDto(word));
    return translationWordDtos;
  }

  async getLastWords(userId: number): Promise<WholeWordDto[]> {
    const user = await this.userRep.findOneBy({ id: userId });
    const words = await this.userWordRepository.find({
      where: {
        user,
      },
      relations: {
        word: {
          translation: true,
        },
      },
      take: 5,
      order: {
        id: 'DESC',
      }
    });
    const translationWordDtos = words.map(word => mapWholeWordDto(word));
    return translationWordDtos;
  }

  async getTranslation(value: string, userId: number): Promise<TransWordDto> {
    const word = await this.wordRepository.findOne({
      where: {
        value,
      },
      relations: {
        translation: true,
      },
    });
    if (word) {
      const translationWord = mapTranslationWordDto(word);
      return translationWord;
    } else {
      const translation = await this.translatorApiService.translate(value);
  
      const newTranslation = new Translation();
      newTranslation.value = translation;

      const newWord = new Word();
      newWord.value = value;
      newWord.translation = newTranslation;

      await this.translationRep.save(newTranslation);
      await this.wordRepository.save(newWord);

      const translationWord = mapTranslationWordDto(newWord);
      return translationWord;
    }
  }

  async getTranslationWithStatus(value: string, userId: number): Promise<TransWordDto> {
    const user = await this.userRep.findOneBy({ id: userId });

    const word = await this.wordRepository.findOne({
      where: {
        value,
      },
      relations: {
        translation: true,
      }
    });
    if (!word) {
      const translation = await this.translatorApiService.translate(value);

      const newTranslation = new Translation();
      newTranslation.value = translation;

      const newWord = new Word();
      newWord.value = value;
      newWord.translation = newTranslation;

      await this.translationRep.save(newTranslation);
      await this.wordRepository.save(newWord);

      const trans: TransStatusWordDto = {
        type: 'word',
        value,
        translation: newTranslation.value,
        status: 'never',
      }
      return trans
    }
    const userWord = await this.userWordRepository.findOne({
      where: {
        user,
        word
      }
    });
    if (!userWord) {
      const trans: TransStatusWordDto = {
        type: 'word',
        value,
        translation: word.translation.value,
        status: 'never',
      }
      return trans;
    } else {
      const trans: TransStatusWordDto = {
        type: 'word',
        value,
        translation: word.translation.value,
        status: userWord.status,
      }
      return trans;
    }
  }

  async getTodayList(userId: number): Promise<TodayWordDto[]> {
    const user = await this.userRep.findOneBy({ id: userId });
  
    //Очищаем старый лист
    const userWords = await this.userWordRepository.find({
      where: {
        user,
        onList: true,
      },
    });
    for (let word of userWords) {
      if (!isToday(word.updateDate)) {
        word.onList = false;
        await this.userWordRepository.save(word);
      }
    }

    //Возвращаем сегодняшний лист, если есть
    const againUserWords = await this.userWordRepository.find({
      where: {
        user,
        onList: true,
      },
      relations: {
        word: {
          translation: true,
        },
      }
    });
    if (againUserWords.length) {
      const todayList: TodayWordDto[] = againUserWords
      .filter(word => !isToday(word.quantityUpdate))
      .map(userWord => {
        return mapTodayWordDto(userWord)
      });
      return todayList;
    }
    
    //Если на сегодня ещё нет слов, пытаемся их вычислить
    const andAgainUserWords = await this.userWordRepository.find({
      where: {
        user,
        status: WordStatus.PROCESS,
      },
      relations: {
        word: {
          translation: true
        },
      }
    });
    const newList: UserWord[] = [];
    for (let userWord of andAgainUserWords) {
      const daysDifference = (Date.now() - userWord.quantityUpdate.getTime()) / (1000 * 3600);
      // console.log((Date.now() - userWord.updateDate.getTime()) / (1000 * 3600))
      if ((daysDifference >= 1) && ((userWord.quantity === 0) || (userWord.quantity === 1))) {
        newList.push(userWord);
        userWord.onList = true;
        await this.userWordRepository.save(userWord);
      } else if ((daysDifference >= 2) && (userWord.quantity === 2)) {
        newList.push(userWord);
        userWord.onList = true;
        await this.userWordRepository.save(userWord);
      } else if ((daysDifference >= 3) && (userWord.quantity === 3)) {
        newList.push(userWord);
        userWord.onList = true;
        await this.userWordRepository.save(userWord);
      } else if ((daysDifference >= 4) && (userWord.quantity === 4)) {
        newList.push(userWord);
        userWord.onList = true;
        await this.userWordRepository.save(userWord);
      } else if ((daysDifference >= 5) && (userWord.quantity === 5)) {
        newList.push(userWord);
        userWord.onList = true;
        await this.userWordRepository.save(userWord);
      }
      if (newList.length === 5) {
        break;
      }
    }

    const newTodayList: TodayWordDto[] = newList.map(userWord => {
      return mapTodayWordDto(userWord)
    });
    return newTodayList;
  }

  async addWord(value: string) {
    const word = new Word();
    word.value = value;
    this.wordRepository.save(word);
    return word;
  }

  async addToProcess(value: string, userId: number) {
    const word = await this.wordRepository.findOneBy({ value });
    if (!word) {
      throw new HttpException('Почему-то такого слова нет', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userRep.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException('Почему-то такого пользователя нет', HttpStatus.BAD_REQUEST);
    }

    const userWord = await this.userWordRepository.findOneBy({ word, user});
    if (userWord) {
      userWord.status = WordStatus.PROCESS;
      userWord.quantity = 0;
      userWord.quantityUpdate = new Date();
      await this.userWordRepository.save(userWord);
      return { message: 'Успешный успех' }
    }

    const newUserWord = new UserWord();
    newUserWord.word = word;
    newUserWord.user = user;
    newUserWord.quantityUpdate = new Date();
    await this.userWordRepository.save(newUserWord);
    return { message: 'Успешный успех' }
  }

  async deleteToStudied(value: string, userId: number) {
    const word = await this.wordRepository.findOneBy({ value });
    if (!word) {
      throw new HttpException('Почему-то такого слова нет', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userRep.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException('Почему-то такого пользователя нет', HttpStatus.BAD_REQUEST);
    }

    const userWord = await this.userWordRepository.findOneBy({ word, user});
    if (!userWord) {
      throw new HttpException('У данного пользователя не было такого слова', HttpStatus.BAD_REQUEST);
    }

    userWord.status = WordStatus.STUDIED;
    await this.userWordRepository.save(userWord);

    return { message: 'Успешный успех' }
  }

  async successfullTry(value: string, userId: number) {
    const word = await this.wordRepository.findOneBy({ value });
    if (!word) {
      throw new HttpException('Почему-то такого слова нет', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userRep.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException('Почему-то такого пользователя нет', HttpStatus.BAD_REQUEST);
    }

    const userWord = await this.userWordRepository.findOneBy({ word, user});
    if (!userWord) {
      throw new HttpException('У данного пользователя не было такого слова', HttpStatus.BAD_REQUEST);
    }

    userWord.quantity++;
    userWord.quantityUpdate = new Date();
    await this.userWordRepository.save(userWord);
  }

  async unsuccessfullTry(value: string, userId: number) {
    const word = await this.wordRepository.findOneBy({ value });
    if (!word) {
      throw new HttpException('Почему-то такого слова нет', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userRep.findOneBy({ id: userId });
    if (!user) {
      throw new HttpException('Почему-то такого пользователя нет', HttpStatus.BAD_REQUEST);
    }

    const userWord = await this.userWordRepository.findOneBy({ word, user});
    if (!userWord) {
      throw new HttpException('У данного пользователя не было такого слова', HttpStatus.BAD_REQUEST);
    }

    userWord.quantityUpdate = new Date();
    await this.userWordRepository.save(userWord);
  }
}
