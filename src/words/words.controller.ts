import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { WordsService } from './words.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TokenPayload } from 'src/auth/dto';

@Controller('words')
export class WordsController {

  constructor(
    private wordsService: WordsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/getAllWords')
  async getAllWords(
    @Req() req: { userPayload: TokenPayload },
  ) {
    return this.wordsService.getAllWords(req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getLastWords')
  async getLastWords(
    @Req() req: { userPayload: TokenPayload },
  ) {
    return this.wordsService.getLastWords(req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getWordTranslation/:value')
  async getTranslation(
    @Param('value') value: string,
    @Req() req: { userPayload: TokenPayload },
  ) {
    return this.wordsService.getTranslation(value, req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getTodayList/')
  async getTodayList(
    @Req() req: { userPayload: TokenPayload },
  ) {
    return this.wordsService.getTodayList(req.userPayload.id);
  }

  @Post('/addWord')
  async addWord(
    @Body() dto: { value: string }
  ) {
    return this.wordsService.addWord(dto.value);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/addToProcess')
  async addToProcess(
    @Req() req: { userPayload: TokenPayload },
    @Body() dto: { value: string }
  ) {
    return this.wordsService.addToProcess(dto.value, req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/deleteToStudied')
  async deleteToStudied(
    @Req() req: { userPayload: TokenPayload },
    @Body() dto: { value: string }
  ) {
    return this.wordsService.deleteToStudied(dto.value, req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/successfullTry')
  async successfullTry(
    @Req() req: { userPayload: TokenPayload },
    @Body() dto: { value: string }
  ) {
    return this.wordsService.successfullTry(dto.value, req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/unsuccessfullTry')
  async unsuccessfullTry(
    @Req() req: { userPayload: TokenPayload },
    @Body() dto: { value: string }
  ) {
    return this.wordsService.unsuccessfullTry(dto.value, req.userPayload.id);
  }
}
