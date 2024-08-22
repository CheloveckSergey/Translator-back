import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { TextsService } from './texts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TokenPayload } from 'src/auth/dto';

@Controller('texts')
export class TextsController {

  constructor(
    private textsService: TextsService,
  ) {}
  
  @UseGuards(JwtAuthGuard)
  @Get('/getAll')
  async getAll(
    @Req() req: { userPayload: TokenPayload }
  ) {
    return this.textsService.getAllTexts()
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getAllByUser')
  async getAllByUser(
    @Req() req: { userPayload: TokenPayload }
  ) {
    return this.textsService.getAllTextsByUser(req.userPayload.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getTextArray/:textId')
  async getTextArray(
    @Req() req: { userPayload: TokenPayload },
    @Param('textId') textId: number,
  ) {
    return this.textsService.getTextArray(textId, req.userPayload.id);
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
  @Post('/changeName')
  async changeName(
    @Body() dto: { name: string, textId: number },
    @Req() req: { userPayload: TokenPayload }
  ) {
    return this.textsService.changeName(dto.name, dto.textId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:textId')
  async delete(
    @Param('textId') textId: number,
  ) {
    return this.textsService.deleteText(textId)
  }
}
