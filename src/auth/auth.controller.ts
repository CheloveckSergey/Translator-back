import { Body, Controller, Post, Response, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResDto, LogDto, RegDto } from './dto';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post('/registration')
  async registration(
    @Body() userDto: RegDto,
    @Response() res,
  ) {
    const authDto = await this.authService.registration(userDto);
    res.cookie(
      'refreshToken', 
      authDto.tokens.refreshToken, 
      {
        maxAge: 1 * 60 * 60 * 1000, 
        httpOnly: true
      }
    );
    const authResDto: AuthResDto = {
      id: authDto.id, 
      login: authDto.login, 
      accessToken: authDto.tokens.accessToken,
    }
    return res.send(authResDto);
  }

  @Post('/login')
  async login(
    @Body() userDto: LogDto,
    @Response() res,
  ) {
    const authDto = await this.authService.login(userDto);
    res.cookie(
      'refreshToken', 
      authDto.tokens.refreshToken, 
      {
        maxAge: 1 * 60 * 60 * 1000, 
        httpOnly: true
      }
    );
    const authResDto: AuthResDto = {
      id: authDto.id, 
      login: authDto.login, 
      accessToken: authDto.tokens.accessToken,
      avatar: authDto.avatar
    }
    return res.send(authResDto);
  }

  @Post('/refresh')
  async refresh(
    @Request() req 
  ) {
    const refreshToken = req.cookies;
    const authDto = await this.authService.refresh(refreshToken?.refreshToken);
    
    const authResDtp: AuthResDto = {
      id: authDto.id, 
      login: authDto.login, 
      accessToken: authDto.tokens.accessToken,
      avatar: authDto.avatar,
    }
    return authResDtp;
  }

  @Post('/logout')
  async logout(
    @Body() { userId } : { userId: number },
    @Response() res,
  ) {
    await this.authService.logout(userId);
    return res.send({message: 'Выход успешно произведён'});
  }
}
