import { ShortTextPreviewDto, TextPreviewDto, TextSchema, TextsInfoDto } from "./dto";
import { Text } from "../text.entity";
import { HttpException, HttpStatus } from "@nestjs/common";
import { User } from "src/users/user.entity";

export function getOneTextPreview(text: Text, meUserId?: number): TextPreviewDto {
  if (!text.user) {
    throw new HttpException('GET_ONE_TEXT_PREVIEW: в тексте нет пользователя', HttpStatus.CONFLICT)
  }

  let isCopied: boolean = false;

  if (meUserId && text.copyUsers?.some(user => user.id === meUserId)) {
    isCopied = true;
  }

  let content: string;
  if (text.blocks?.length) {
    const content: string = text.blocks.slice(0, 5).reduce((prev, cur) => {
      return prev + cur.original
    }, '');
  } else {
    content = '';
  }

  const oneText: TextPreviewDto = {
    id: text.id,
    name: text.name,
    content,
    author: {
      id: text.user.id,
      login: text.user.login,
    },
    updateDate: text.updatedDate,
    createDate: text.createdDate,
    isCopied,
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

// export function mapCreateTextResponse(text: Text): CreateTextResponse {
//   return {
//     id: text.id,
//     name: text.name,
//   }
// }