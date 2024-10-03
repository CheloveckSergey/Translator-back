import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository, getRepository } from 'typeorm';
import { Text } from './text.entity';
import { User } from 'src/users/user.entity';
import { UserWord, WordStatus } from 'src/words/user-word.entity';
import { Word } from 'src/words/word.entity';
import { TranslatorApiService } from 'src/translator-api/translator-api.service';
import { WordsService } from 'src/words/words.service';
import { Translation } from 'src/words/translation.entity';
import { TextSpanDto, TransTextDto, TranslationDto } from './dto';
import { ConnectionDto, StringSpanDto, WordSpanDto } from 'src/words/dto';
import { TextPreviewsQuery } from './texts.controller';

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

  async getAllTextPreviewsByUser(query: TextPreviewsQuery) {
    const textsQb = await this.textRep.createQueryBuilder('text');

    if (query.userId) {
      textsQb.where("text.userId = :userId", { userId: query.userId });
    }

    if (query.limit) {
      textsQb.limit(query.limit);
    }

    if (query.offset) {
      textsQb.offset(query.offset);
    }

    if (query.order) {
      textsQb.orderBy('text.id', query.order);
    }

    return textsQb.getMany();
  }

  async getTextSpan(textId: number, userId: number): Promise<TextSpanDto> {
    const text = await this.textRep.findOneBy({ id: textId });

    const regexp = /\b(\w+)\b('\w+)*|\.|,|\s|:|-|;|!|\?/gi;
    const result = text.content.match(regexp);

    const stringSpans: StringSpanDto[] = await Promise.all(result.map(async match => {
      const textRE = /\w+/gi;
      if (textRE.test(match)) {
        return await this.wordsService.mapWordSpan(match, userId);
      } else {
        const stringSpan: ConnectionDto = {
          type: 'connection',
          value: match,
        }
        return stringSpan;
      }
    }));

    const textSpan: TextSpanDto = {
      id: text.id,
      name: text.name,
      stringSpans: stringSpans,
      translation: text.translation,
    }
    return textSpan;
  }

  async getTranslation(value: string, userId: number): Promise<TranslationDto> {
    const textRE = /\w+/gi;
    if (textRE.test(value)) {
      return this.wordsService.getTranslationWithStatus(value, userId)
    } else {
      const translation = await this.transApiService.translate(value);
      const transTextDto: TransTextDto = {
        type: 'text',
        value: value,
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
    
    return text
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
