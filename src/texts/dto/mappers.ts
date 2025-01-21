import { ShortTextPreviewDto, TextPreviewDto, TextSchema, TextsInfoDto } from "./dto";
import { Text } from "../text.entity";
import { HttpException, HttpStatus } from "@nestjs/common";
import { User } from "src/users/user.entity";
import { TextsQuery } from "./query";

export function getOneTextPreview(text: Text, meUserId?: number): TextPreviewDto {
  if (!text.user) {
    throw new HttpException('GET_ONE_TEXT_PREVIEW: в тексте нет пользователя', HttpStatus.CONFLICT)
  }

  let isCopied: boolean = false;

  if (meUserId && text.copyUsers?.some(user => user.id === meUserId)) {
    isCopied = true;
  }

  const content = text.content.slice(0, 652);

  const oneText: TextPreviewDto = {
    id: text.id,
    name: text.name,
    content,
    author: {
      id: text.user.id,
      login: text.user.login,
    },
    isCopied,
    updateDate: text.updatedDate,
    createDate: text.createdDate,
  }
  return oneText
}

export function mapShortTextDto(text: Text) {
  if (!text.user) {
    throw new HttpException('GET_ONE_TEXT_PREVIEW: в тексте нет пользователя', HttpStatus.CONFLICT)
  }

  const textDto: ShortTextPreviewDto = {
    id: text.id,
    name: text.name,
    author: {
      id: text.user.id,
      login: text.user.login,
    },
    createDate: String(text.createdDate),
  }
  return textDto;
}

export function mapTextsInfo(user: User): TextsInfoDto {
  const ownTextsNumber = user.texts.length;
  const copiedTextsNumber = user.copyTexts.length;
  const generalTextsNumber = ownTextsNumber + copiedTextsNumber;

  const textsInfoDto: TextsInfoDto = {
    generalTextsNumber,
    ownTextsNumber,
    copiedTextsNumber,
  }

  return textsInfoDto
}

export function mapTextDto<K extends keyof TextSchema>(
  text: Text, 
  query: TextsQuery<K>, 
  meUserId?: number
): Pick<TextSchema, K> {

  const dto: Partial<TextSchema> = {}

  for (let field of query.fields) {
    if (field === 'id') {
      dto['id'] = text.id;
    }
    if (field === 'name') {
      dto['name'] = text.content;
    }
    if (field === 'content') {
      dto['content'] = text.content;
    }
    if (field === 'createDate') {
      dto['createDate'] = text.createdDate;
    }
    if (field === 'updateDate') {
      dto['updateDate'] = text.updatedDate;
    }
    if (field === 'author') {
      dto['author'] = {
        id: text.user.id,
        login: text.user.login,
      };
    }
    if (field === 'isCopied') {
      let isCopied: boolean = false;

      if (meUserId && text.copyUsers?.some(user => user.id === meUserId)) {
        isCopied = true;
      }

      dto['isCopied'] = isCopied;
    }
  }

  return dto as Pick<TextSchema, K>
}