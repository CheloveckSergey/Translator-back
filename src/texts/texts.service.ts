import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { FindOptionsOrder, FindOptionsRelationByString, FindOptionsRelations, FindOptionsWhere, In, MoreThan, MoreThanOrEqual, Repository, getRepository } from 'typeorm';
import { Text } from './text.entity';
import { User } from 'src/users/user.entity';
import { TranslatorApiService } from 'src/translator-api/translator-api.service';
import { WordsService } from 'src/words/words.service';
import { Block, CreateTextDto, EditingBlockDto, EditingTextSpanDto, SaveBlocksDto, ShortTextPreviewDto, TextPreviewDto, TextSchema, TextSpanDto, TextsInfoDto, TransTextDto, TranslationDto } from './dto/dto';
import { ConnectionDto, StringSpanDto } from 'src/words/dto/dto';
import { getOneTextPreview, mapShortTextDto, mapTextsInfo } from './dto/mappers';
import { AllTextPreviewsQuery, TextPreviewsQuery, TextQuery, TextsInfoQuery } from './dto/query';
import { UserSettingsService } from 'src/user-settings/user-settings.service';
import { TextBlock } from './block.entity';

@Injectable()
export class TextsService {

  constructor(
    @Inject('TEXT_REPOSITORY') 
    private textRep: Repository<Text>,
    @Inject('USER_REPOSITORY') 
    private userRep: Repository<User>,
    @Inject('TEXT_BLOCK_REPOSITORY') 
    private textBlockRep: Repository<TextBlock>,
    private transApiService: TranslatorApiService,
    private wordsService: WordsService,
    private userSettingsService: UserSettingsService,
  ) {}

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

    const texts = await this.textRep.find({
      where: [
        { user: { id: query.userId } },
        { id: In(textIds) },
      ],
      relations: {
        copyUsers: true,
        user: true,
        blocks: true,
      },
      ...(query.limit && { take: query.limit }),
      ...(query.offset && { skip: query.offset }),
      ...(query.order && { order: { id: query.order } }),
    });
    return texts.map((text => getOneTextPreview(text, meUserId)));
  }

  async getAllTextPreviews(query: AllTextPreviewsQuery, meUserId?: number): Promise<TextPreviewDto[]> {
    const texts = await this.textRep.find({
      relations: {
        copyUsers: true,
        user: true,
        blocks: true,
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
    const text = await this.textRep.findOne({ 
      where: {
        id: textId,
      },
      relations: {
        blocks: true,
      }
    });

    const regexp = /\b(\w+)\b('\w+)*|\.|,|\s|:|-|;|!|\?/gi;

    const blocks: Block[] = await Promise.all(text.blocks.map(async block => {
      const result = block.original.match(regexp);
  
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

      const blockDto: Block = {
        id: block.id,
        original: stringSpans,
        translation: block.translation,
      }
      return blockDto
    }))

    const textSpan: TextSpanDto = {
      id: text.id,
      name: text.name,
      blocks,
      premiere: text.premiere,
    }
    return textSpan;
  }

  async getEditingTextSpan(query: TextQuery): Promise<EditingTextSpanDto> {
    const text = await this.textRep.findOne({
      where: {
        id: query.textId,
      }
    });

    const limit = 4;

    const blocksTotal: number = await this.textBlockRep.count({
      where: {
        text: {
          id: query.textId,
        }
      }
    });
    let pagesTotal: number = Math.ceil(blocksTotal / limit);

    const skip = limit * query.page;

    const blocks = await this.textBlockRep.find({
      where: {
        text: {
          id: query.textId,
        },
      },
      take: limit,
      skip: skip,
      order: {
        order: 'ASC',
      }
    });

    const blockDtos: EditingBlockDto[] = await Promise.all(blocks.map(async block => {
      const blockDto: EditingBlockDto = {
        id: block.id,
        original: block.original,
        translation: block.translation,
      }
      return blockDto
    }));

    const textSpan: EditingTextSpanDto = {
      id: text.id,
      name: text.name,
      blocks: blockDtos,
      pagesTotal,
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

  async createText(dto: CreateTextDto, meUserId: number): Promise<TextPreviewDto> {
    if (dto.userId !== meUserId) {
      throw new HttpException('Не совпадают айди пользователей', HttpStatus.FORBIDDEN)
    }

    const text = new Text();
    text.name = dto.name;

    const user = await this.userRep.findOneBy({ id: dto.userId });

    text.user = user;
    await this.textRep.save(text);
    
    const _text = await this.textRep.findOne({
      where: {
        id: text.id,
      },
      relations: {
        user: true,
      }
    });
    return getOneTextPreview(_text)
  }

  async addNewBlock(original: string, translation: string, textId: number) {
    const text = await this.textRep.findOne({
      where: {
        id: textId,
      },
      relations: {
        user: true,
      }
    });

    const lastBlocks = await this.textBlockRep.find({
      where: {
        text: {
          id: textId,
        },
      },
      order: {
        order: 'DESC',
      },
      take: 1,
    });
    const lastBlockOrder = lastBlocks[0]?.order ? lastBlocks[0]?.order : 0;

    const block = new TextBlock();
    block.original = original;
    block.translation = translation;
    block.text = text;
    block.order = lastBlockOrder + 1;
    await this.textBlockRep.save(block);
  }

  async addNewBlockAbove(original: string, translation: string, textId: number, blockId: number) {
    const text = await this.textRep.findOne({
      where: {
        id: textId,
      },
      relations: {
        user: true,
      }
    });

    const initialBlock = await this.textBlockRep.findOne({
      where: {
        id: blockId,
      }
    });
    const order = initialBlock.order;

    const blocksBelow = await this.textBlockRep.find({
      where: {
        order: MoreThanOrEqual(order),
      }
    })
    for (let block of blocksBelow) {
      block.order = block.order + 1;
      await this.textBlockRep.save(block);
    }

    const block = new TextBlock();
    block.original = original;
    block.translation = translation;
    block.text = text;
    block.order = order;
    await this.textBlockRep.save(block);

  }

  async saveBlocks(dto: SaveBlocksDto, meUserId: number) {
    const text = await this.textRep.findOne({
      where: {
        id: dto.textId,
      },
      relations: {
        user: true,
      }
    });

    if (!text) {
      throw new HttpException('Такого текста нету', HttpStatus.BAD_REQUEST)
    }

    if (meUserId !== text.user.id) {
      throw new HttpException('Вам запрещено редактировать этот текст', HttpStatus.FORBIDDEN)
    }

    for (let blockDto of dto.blocks) {
      if (blockDto.type === 'newBlockAbove') {
        await this.addNewBlockAbove(blockDto.original, blockDto.translation, dto.textId, blockDto.blockId);
      } else if (blockDto.type === 'new') {
        await this.addNewBlock(blockDto.original, blockDto.translation, dto.textId);
      } else if (blockDto.type === 'edit') {
        const block = await this.textBlockRep.findOne({
          where: {
            id: blockDto.blockId,
          },
        });
        block.original = blockDto.original;
        block.translation = blockDto.translation;
        await this.textBlockRep.save(block);
      } else {
        const block = await this.textBlockRep.findOne({
          where: {
            id: blockDto.blockId,
          },
        });
        await this.textBlockRep.remove(block);
      }
    }

    return { message: 'Ну вроде готово' }
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
    });

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

    const blocks = await this.textBlockRep.find({
      where: {
        text: {
          id: textId,
        }
      }
    });
    await Promise.all(blocks.map(async (block) => {
      await this.textBlockRep.remove(block);
    }));
    await this.textRep.remove(text);

    return { message: 'Текст успешно удалён' };
  }
}
