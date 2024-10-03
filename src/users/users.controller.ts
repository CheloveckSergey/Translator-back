import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TokenPayload } from 'src/auth/dto';

export type SentRequestStatus = 'sentTo' | 'sentFrom' | undefined;

export interface UserDto {
  id: number;
  login: string;
  isFriend: boolean;
  isSentRequest: SentRequestStatus;
}

@Controller('users')
export class UsersController {

  constructor(
    private usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/getAllUsers1')
  async getAllUsers1(
    @Req() req: { userPayload: TokenPayload },
  ) {
    return this.usersService.getAllUsers1(req.userPayload.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getUserById/:id')
  async getUserById(
    @Param('id') id: number,
    @Req() req: { userPayload: TokenPayload },
  ) {
    return this.usersService.getUserById(id, req.userPayload.id);
  }
}
