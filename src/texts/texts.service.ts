import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Text } from './text.entity';
import { User } from 'src/users/user.entity';
import { UserWord, WordStatus } from 'src/words/user-word.entity';
import { Word } from 'src/words/word.entity';
import { TranslatorApiService } from 'src/translator-api/translator-api.service';
import { ConnectionDto, StringSpanDto, TransWordDto, WordSpanDto, WordsService } from 'src/words/words.service';
import { Translation } from 'src/words/translation.entity';

export interface TextSpanDto {
  id: number,
  name: string,
  stringSpans: StringSpanDto[], 
  translation: string | undefined,
}



export type TranslationDto = TransTextDto | TransWordDto;

interface TransTextDto {
  type: 'text',
  value: string,
  stringSpans: StringSpanDto[],
  translation: string,
}



@Injectable()
export class TextsService {

  constructor(
    @Inject('TEXT_REPOSITORY') 
    private textRep: Repository<Text>,
    @Inject('USER_REPOSITORY') 
    private userRep: Repository<User>,
    @Inject('USER_WORD_REPOSITORY')
    private userWordRep: Repository<UserWord>,
    @Inject('WORD_REPOSITORY')
    private wordRep: Repository<Word>,
    @Inject('TRANSLATION_REPOSITORY')
    private translationRep: Repository<Translation>,
    private transApiService: TranslatorApiService,
    private wordsService: WordsService,
  ) {}

  async getAllTexts() {
    const texts = await this.textRep.find();
    return texts;
  }

  async getAllTextsByUser(userId: number) {
    const user = await this.userRep.findOneBy({ id: userId });
    const texts = await this.textRep.find({
      where: {
        user,
      }
    });
    return texts;
  }

  async getLastTextsByUser(userId: number) {
    const user = await this.userRep.findOneBy({ id: userId });
    const texts = await this.textRep.find({
      where: {
        user,
      },
      take: 3,
      order: {
        id: 'DESC',
      }
    });
    return texts;
  }

  async getTextArray(textId: number, userId: number): Promise<TextSpanDto> {
    const user = await this.userRep.findOneBy({ id: userId });
    const text = await this.textRep.findOneBy({ id: textId });

    const regexp = /\b(\w+)\b('\w+)*|\.|,|\s|:|-|;|!|\?/gi;
    const result = text.content.match(regexp);

    const stringSpans: StringSpanDto[] = await Promise.all(result.map(async match => {
      const textRE = /\w+/gi;
      if (textRE.test(match)) {
        const word = await this.wordRep.findOneBy({ value: match });
        if (!word) {
          const stringSpan: WordSpanDto = {
            type: 'word',
            value: match,
            status: 'never',
          }
          return stringSpan
        }
        const userWord = await this.userWordRep.findOne({
          where: {
            user,
            word
          }
        });
        if (!userWord) {
          const stringSpan: WordSpanDto = {
            type: 'word',
            value: match,
            status: 'never',
          }
          return stringSpan;
        } else {
          const stringSpan: WordSpanDto = {
            type: 'word',
            value: match,
            status: userWord.status,
          }
          return stringSpan;
        }
      } else {
        const stringSpan: ConnectionDto = {
          type: 'connection',
          value: match,
        }
        return stringSpan;
      }
    }));

    const textArrayDto: TextSpanDto = {
      id: text.id,
      name: text.name,
      stringSpans: stringSpans,
      translation: text.translation,
    }
    return textArrayDto;
  }

  async getStringSpans(text: string, userId: number): Promise<StringSpanDto[]> {
    const user = await this.userRep.findOneBy({ id: userId });

    const regexp = /\b(\w+)\b('\w+)*|\.|,|\s|:|-|;|!|\?/gi;
    const result = text.match(regexp);

    const stringSpans: StringSpanDto[] = await Promise.all(result.map(async match => {
      const textRE = /\w+/gi;
      if (textRE.test(match)) {
        const word = await this.wordRep.findOneBy({ value: match });
        if (!word) {
          const stringSpan: WordSpanDto = {
            type: 'word',
            value: match,
            status: 'never',
          }
          return stringSpan
        }
        const userWord = await this.userWordRep.findOne({
          where: {
            user,
            word
          }
        });
        if (!userWord) {
          const stringSpan: WordSpanDto = {
            type: 'word',
            value: match,
            status: 'never',
          }
          return stringSpan;
        } else {
          const stringSpan: WordSpanDto = {
            type: 'word',
            value: match,
            status: userWord.status,
          }
          return stringSpan;
        }
      } else {
        const stringSpan: ConnectionDto = {
          type: 'connection',
          value: match,
        }
        return stringSpan;
      }
    }));
    return stringSpans;
  }

  async getTranslation(value: string, userId: number): Promise<TranslationDto> {
    // const user = await this.userRep.findOneBy({ id: userId });

    const textRE = /\w+/gi;
    if (textRE.test(value)) {
      return this.wordsService.getTranslationWithStatus(value, userId)
    } else {
      const stringSpans = await this.getStringSpans(value, userId);
      const translation = await this.transApiService.translate(value);
      const transTextDto: TransTextDto = {
        type: 'text',
        value: value,
        stringSpans: stringSpans,
        translation,
      }
      return transTextDto;
    }
  }

  async createText(name: string, content: string, userId: number) {
    const text = new Text();
    text.name = name;
    text.content = content;

    const translation = await this.transApiService.translate(content);

    text.translation = translation;

    const user = await this.userRep.findOneBy({ id: userId });

    text.user = user;
    await this.textRep.save(text);
    const newText = await this.textRep.findOneBy({
      name,
    })
    return newText;
  }

  async changeName(name: string, textId: number) {
    const text = await this.textRep.findOneBy({ id: textId });
    text.name = name;
    await this.textRep.save(text);
    return text;
  }

  async deleteText(textId: number) {
    const text = await this.textRep.findOneBy({ id: textId });
    
    if (!text) {
      throw new HttpException('Текста с таким ID не существует', HttpStatus.BAD_REQUEST);
    }

    await this.textRep.remove(text);

    return { message: 'Текст успешно удалён' };
  }
}
