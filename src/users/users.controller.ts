import { Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TokenPayload } from 'src/auth/dto';
import { UncsJwtAuthGuard } from 'src/auth/unnecessaryJwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

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
  
  @UseGuards(UncsJwtAuthGuard)
  @Get('/getUserById/:id')
  async getUserById(
    @Param('id') id: number,
    @Req() req: { userPayload?: TokenPayload },
  ) {
    return this.usersService.getUserById(id, req.userPayload?.id);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('/updateAvatar')
  @UseInterceptors(FileInterceptor('img'))
  async updateAvatar(
    @Req() req: { userPayload: TokenPayload },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(file, req.userPayload.id);
  }
}
