import { ShortTextPreviewDto, TextPreviewDto, TextSchema } from "./dto";
import { Text } from "../text.entity";
import { HttpException, HttpStatus } from "@nestjs/common";

export function getOneTextPreview(text: Text, meUserId?: number): TextPreviewDto {
  if (!text.user) {
    throw new HttpException('GET_ONE_TEXT_PREVIEW: в тексте нет пользователя', HttpStatus.CONFLICT)
  }

  let isCopied: boolean = false;

  if (meUserId && text.copyUsers?.some(user => user.id === meUserId)) {
    isCopied = true;
  }

  const oneText: TextPreviewDto = {
    id: text.id,
    name: text.name,
    content: text.content,
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

// export function getTextPreviewDto<K extends keyof TextSchema>(
//   text: Text, 
//   query: TextsQuery<K>, 
//   meUserId?: number
// ): Pick<TextSchema, K | 'id' | 'name'> {

//   const dto: Pick<TextSchema, K | 'id' | 'name'> = {
//     'id': 12,
//     'name': 'sadf',
//   }

//   //include выдаёт непонятную ошибку ебать
//   if (query.fields.includes('content')) {
//     dto.content = text.content
//   }
// }