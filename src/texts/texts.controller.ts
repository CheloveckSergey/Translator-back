import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TextsService } from './texts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TokenPayload } from 'src/auth/dto';
import { TextPreviewsQuery } from './dto/query';
import { UncsJwtAuthGuard } from 'src/auth/unnecessaryJwt-auth.guard';

// При получении текстов, необходимо проверять разрешения на получение текстов.
// Если тексты может получить любой юзер, то необходимость проверки текущего пользователя отсутствует.
// Если тексты может получить не любой юзер, то необходимо проверять текущего пользователя. Если
// пользователь отсутсвует или у текущего пользователя нет доступа к этим текстам, то доступ отказан.

@Controller('texts')
export class TextsController {

  constructor(
    private textsService: TextsService,
  ) {}

  @UseGuards(UncsJwtAuthGuard)
  @Get('/getAllTextPreviewsByUser')
  async getAllByUser(
    @Req() req: { userPayload?: TokenPayload },
    @Query() query: TextPreviewsQuery,
  ) {
    return this.textsService.getAllTextPreviewsByUser(query, req.userPayload?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getFriendsLastTexts')
  async getFriendsLastTexts(
    @Req() req: { userPayload: TokenPayload },
  ) {
    return this.textsService.getFriendsLastTexts(req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getTextSpan/:textId')
  async getTextArray(
    @Req() req: { userPayload: TokenPayload },
    @Param('textId') textId: number,
  ) {
    return this.textsService.getTextSpan(textId, req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async create(
    @Body() dto: { name: string, content: string },
    @Req() req: { userPayload: TokenPayload }
  ) {
    return this.textsService.createText(dto.name, dto.content, req.userPayload.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('/copyText')
  async copyText(
    @Body() dto: { textId: number },
    @Req() req: { userPayload: TokenPayload }
  ) {
    return this.textsService.copyText(dto.textId, req.userPayload.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('/uncopyText')
  async uncopyText(
    @Body() dto: { textId: number },
    @Req() req: { userPayload: TokenPayload }
  ) {
    return this.textsService.uncopyText(dto.textId, req.userPayload.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('/changeName')
  async changeName(
    @Body() dto: { name: string, textId: number },
    @Req() req: { userPayload: TokenPayload }
  ) {
    return this.textsService.changeName(dto.name, dto.textId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/getTranslation')
  async getTranslation(
    @Body() dto: { value: string },
    @Req() req: { userPayload: TokenPayload }
  ) {
    return this.textsService.getTranslation(dto.value, req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:textId')
  async delete(
    @Param('textId') textId: number,
  ) {
    return this.textsService.deleteText(textId)
  }
}
