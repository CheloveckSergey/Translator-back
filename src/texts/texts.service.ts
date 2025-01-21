import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { FindOptionsOrder, FindOptionsRelationByString, FindOptionsRelations, FindOptionsWhere, In, MoreThan, Repository, getRepository } from 'typeorm';
import { Text } from './text.entity';
import { User } from 'src/users/user.entity';
import { TranslatorApiService } from 'src/translator-api/translator-api.service';
import { WordsService } from 'src/words/words.service';
import { ShortTextPreviewDto, TextPreviewDto, TextSchema, TextSpanDto, TextsInfoDto, TransTextDto, TranslationDto } from './dto/dto';
import { ConnectionDto, StringSpanDto } from 'src/words/dto/dto';
import { getOneTextPreview, mapShortTextDto, mapTextDto, mapTextsInfo } from './dto/mappers';
import { TextPreviewsQuery, TextsInfoQuery, TextsQuery } from './dto/query';
import { UserSettingsService } from 'src/user-settings/user-settings.service';

@Injectable()
export class TextsService {

  constructor(
    @Inject('TEXT_REPOSITORY') 
    private textRep: Repository<Text>,
    @Inject('USER_REPOSITORY') 
    private userRep: Repository<User>,
    private transApiService: TranslatorApiService,
    private wordsService: WordsService,
    private userSettingsService: UserSettingsService,
  ) {}

  async getTexts<K extends keyof TextSchema>(query: TextsQuery<K>, meUserId?: number) {
    const where: FindOptionsWhere<Text>[] = [];
    const relations: FindOptionsRelations<Text> = {}

    if (query.by === 'user') {
      const access = await this.userSettingsService.checkTextsPrivacy(query.userId, meUserId);
      if (!access) {
        throw new HttpException('Вы не можете', HttpStatus.FORBIDDEN)
      }

      const user = await this.userRep.findOne({
        where: {
          id: query.userId,
        },
        relations: {
          copyTexts: true,
        }
      });

      where.push({ user: { id: query.userId } });
      where.push({ id: In(user.copyTexts.map(text => text.id)) });

      relations.copyUsers = true;
      relations.user = true;
    } else if (query.by === 'friends') {
      if (query.userId !== meUserId) {
        throw new HttpException('Вы не можете', HttpStatus.FORBIDDEN)
      }

      const user = await this.userRep.findOne({
        where: {
          id: query.userId,
        },
        relations: {
          friends: true,
        }
      });
      const friends = user.friends;
  
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 3);

      where.push({
        user: {
          id: In(friends.map(user => user.id)),
        },
        createdDate: MoreThan(fiveDaysAgo),
      })
      
      relations.user = true;
    } else if (query.by === 'title') {
      where.push({ name: query.title });
    }

    const take: number | undefined = query.limit;
    const skip: number | undefined = query.offset;
    const order: FindOptionsOrder<Text> | undefined = { id: query.order }

    const texts = await this.textRep.find({
      where,
      relations,
      take,
      skip,
      order,
    });
    return texts.map((text => mapTextDto(text, query, meUserId)));
  }

  async getAllTextPreviewsByUser(query: TextPreviewsQuery, meUserId?: number): Promise<TextPreviewDto[]> {
    if (query.userId != meUserId) {
      const access = await this.userSettingsService.checkTextsPrivacy(query.userId, meUserId);
  
      if (!access) {
        throw new HttpException('Вы не можете', HttpStatus.FORBIDDEN);
      } 
    }

    const user = await this.userRep.findOne({
      where: {
        id: query.userId,
      },
      relations: {
        copyTexts: true,
      }
    });

    const textIds = user.copyTexts.map(text => text.id);
    textIds.push(query.userId);

    const texts = await this.textRep.find({
      where: [
        { user: { id: query.userId } },
        { id: In(user.copyTexts.map(text => text.id)) },
      ],
      relations: {
        copyUsers: true,
        user: true,
      },
      ...(query.limit && { take: query.limit }),
      ...(query.offset && { skip: query.offset }),
      ...(query.order && { order: { id: query.order } }),
    });
    return texts.map((text => getOneTextPreview(text, meUserId)));
  }

  async getFriendsLastTexts(meUserId: number): Promise<ShortTextPreviewDto[]> {
    const user = await this.userRep.findOne({
      where: {
        id: meUserId,
      },
      relations: {
        friends: true,
      }
    });
    const friends = user.friends;

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 3);

    const texts = await this.textRep.find({
      where: {
        user: {
          id: In(friends.map(user => user.id)),
        },
        createdDate: MoreThan(fiveDaysAgo),
      },
      relations: {
        user: true,
      },
    });
    return texts.map((text => mapShortTextDto(text)));
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
    const textRE = /^\w+$/gi;
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

  async getTextsInfo(query: TextsInfoQuery): Promise<TextsInfoDto> {

    const where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = [];
    where.push({
      id: query.userId,
    })

    const relations: FindOptionsRelations<User> = {}
    relations.texts = true;
    relations.copyTexts = true;

    const user = await this.userRep.findOne({
      where,
      relations,
    })

    return mapTextsInfo(user)
  }

  async createText(name: string, content: string, userId: number): Promise<TextPreviewDto> {
    const text = new Text();
    text.name = name;
    text.content = content;

    console.log(this.transApiService.translate);
    const translation = await this.transApiService.translate(content);

    text.translation = translation;

    const user = await this.userRep.findOneBy({ id: userId });

    text.user = user;
    await this.textRep.save(text);
    
    return getOneTextPreview(text)
  }

  async copyText(textId: number, meUserId: number) {
    const text = await this.textRep.findOne({
      where: {
        id: textId,
      },
      relations: {
        copyUsers: true,
      }
    });

    const user = await this.userRep.findOne({
      where: {
        id: meUserId,
      }
    })

    text.copyUsers.push(user);
    await this.textRep.save(text);

    return { message: 'Текст скопирован' }
  }

  async uncopyText(textId: number, meUserId: number) {
    const text = await this.textRep.findOne({
      where: {
        id: textId,
      },
      relations: {
        copyUsers: true,
      }
    });

    text.copyUsers = text.copyUsers.filter(user => user.id !== meUserId);
    await this.textRep.save(text);

    return { message: 'Текст анскопирован' }
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
