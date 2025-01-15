import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Word } from './word.entity';
import { UserWord, WordStatus } from './user-word.entity';
import { TranslatorApiService } from 'src/translator-api/translator-api.service';
import { User } from 'src/users/user.entity';
import { Translation } from './translation.entity';
import { TodayWordDto, TransStatusWordDto, TransWordDto, WholeWordDto, WordSpanDto } from './dto/dto';
import { mapTodayWordDto, mapTranslationWordDto, mapWholeWordDto } from './dto/mappers';
import { WholeWordQuery } from './words.controller';

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

  async getAllWords(query: WholeWordQuery): Promise<WholeWordDto[]> {
    const words = await this.userWordRepository.find({
      where: {
        user: {
          id: query.userId,
        }
      },
      relations: {
        word: {
          translation: true,
        },
      },
      skip: query.offset,
      take: query.limit,
      order: {
        id: query.order,
      }
    });
    const translationWordDtos = words.map(word => mapWholeWordDto(word));
    return translationWordDtos;
  }

  async getTranslation(value: string): Promise<TransWordDto> {
    let word = await this.wordRepository.findOne({
      where: {
        value,
      },
      relations: {
        translation: true,
      },
    });

    if (!word) {
      word = await this.addWord(value);
    }
    
    return mapTranslationWordDto(word)
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
      const word = await this.addWord(value);
      const trans: TransStatusWordDto = {
        type: 'word',
        value: word.value,
        translation: word.translation.value,
        status: 'never',
      }
      return trans
    }

    const userWord = await this.userWordRepository.findOne({
      where: {
        user,
        word,
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

  async addWord(value: string): Promise<Word> {
    console.log(value);
    const translation = await this.translatorApiService.translate(value);
  
    const newTranslation = new Translation();
    newTranslation.value = translation.toLowerCase();

    const word = new Word();
    word.value = value.toLowerCase();
    word.translation = newTranslation;

    await this.translationRep.save(newTranslation);
    await this.wordRepository.save(word);

    return word
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
    if (userWord.quantity === 5) {
      await this.deleteToStudied(value, userId);
    }
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

  async mapWordSpan(value: string, userId: number): Promise<WordSpanDto> {
    const user = await this.userRep.findOneBy({ id: userId });

    const word = await this.wordRepository.findOneBy({ value: value.toLowerCase() });
    if (!word) {
      const stringSpan: WordSpanDto = {
        type: 'word',
        value: value,
        status: 'never',
      }
      return stringSpan
    }
    const userWord = await this.userWordRepository.findOne({
      where: {
        user,
        word
      }
    });
    if (!userWord) {
      const stringSpan: WordSpanDto = {
        type: 'word',
        value: value,
        status: 'never',
      }
      return stringSpan;
    } else {
      const stringSpan: WordSpanDto = {
        type: 'word',
        value: value,
        status: userWord.status,
      }
      return stringSpan;
    }
  }
}
