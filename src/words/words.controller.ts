import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { WordsService } from './words.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TokenPayload } from 'src/auth/dto';
import { WordsInfoQuery } from './dto/query';

export interface WholeWordQuery {
  limit?: number,
  offset?: number,
  order?: 'ASC' | 'DESC',
  userId: number,
}

@Controller('words')
export class WordsController {

  constructor(
    private wordsService: WordsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/getAllWords')
  async getAllWords(
    @Req() req: { userPayload: TokenPayload },
    @Query() query: WholeWordQuery,
  ) {
    return this.wordsService.getAllWords(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getWordTranslation/:value')
  async getTranslation(
    @Param('value') value: string,
  ) {
    return this.wordsService.getTranslation(value);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getTodayList/')
  async getTodayList(
    @Req() req: { userPayload: TokenPayload },
  ) {
    return this.wordsService.getTodayList(req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getWordsInfo/')
  async getWordsInfo(
    @Req() req: { userPayload: TokenPayload },
    @Query() query: WordsInfoQuery,
  ) {
    return this.wordsService.getWordsInfo(query);
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
