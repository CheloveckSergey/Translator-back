import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TokenPayload } from 'src/auth/dto';
import { ChangeUserSettingReqDto, changeUserSettingDto, changeUserSettingSchema } from './dto/query';
import { ZodValidationPipe } from 'src/zod';

@Controller('user-settings')
export class UserSettingsController {

  constructor(
    private userSettingsService: UserSettingsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/getSettings/:id')
  async getSettings(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { userPayload?: TokenPayload },
  ) {
    return this.userSettingsService.getSettings(id, req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  // @UsePipes(new ZodValidationPipe(changeUserSettingSchema))
  @Post('/changeSettings')
  async changeSettings(
    @Body() dto: ChangeUserSettingReqDto,
    @Req() req: { userPayload?: TokenPayload },
  ) {
    return this.userSettingsService.changeSettings(dto, req.userPayload.id);
  }
}
