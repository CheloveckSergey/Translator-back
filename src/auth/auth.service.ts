import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RefreshToken } from './refreshToken.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/users/user.entity';
import { AuthDto, LogDto, RegDto, TokenPayload, Tokens } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @Inject('REFRESH_TOKEN_REPOSITORY') 
    private refreshTokRep: Repository<RefreshToken>,
    private usersService: UsersService,
  ) {}

  async registration(dto: RegDto): Promise<AuthDto> {
    const candidate = await this.usersService.getUserByLogin(dto.login);
    if (candidate) {
      throw new HttpException('Пользователь с таким логином уже существует', HttpStatus.BAD_REQUEST);
    } 

    const hashPassword = await bcrypt.hash(dto.password, 5);
    const user = await this.usersService.createUser({ login: dto.login, password: hashPassword });
    const tokens = await this.generateTokens(user);

    const refreshToken = new RefreshToken();
    refreshToken.value = tokens.refreshToken;
    refreshToken.user = user;
    await this.refreshTokRep.save(refreshToken);

    return {id: user.id, login: user.login, tokens};
  }

  async login(dto: LogDto): Promise<AuthDto> {
    const user = await this.usersService.getUserByLogin(dto.login);
    if (!user) {
      throw new HttpException('Пользователь с таким логином не найден', HttpStatus.UNAUTHORIZED);
    }

    const passwordRight = await bcrypt.compare(dto.password, user.password);
    if (!passwordRight) {
      throw new HttpException('Неверный пароль', HttpStatus.UNAUTHORIZED);
    }

    const tokens = await this.generateTokens(user);
    const refreshToken = await this.refreshTokRep.findOneBy({
        user,
    });
    if (refreshToken) {
      refreshToken.value = tokens.refreshToken;
      await this.refreshTokRep.save(refreshToken);
    } else {
      const refreshToken = new RefreshToken();
      refreshToken.value = tokens.refreshToken;
      refreshToken.user = user;
      await this.refreshTokRep.save(refreshToken);
    }
    return {id: user.id, login: user.login, tokens, avatar: user.avatar};
  }

  async refresh(refreshTok: string): Promise<AuthDto> {
    if (!refreshTok) {
      throw new HttpException('Отсутствует рефрештокен', HttpStatus.BAD_REQUEST);
    }

    const refreshToken = await this.refreshTokRep.findOneBy({
      value: refreshTok,
    });
    if (!refreshToken) {
      throw new HttpException('Такого рефрештокена нет в базе данных', HttpStatus.BAD_REQUEST);
    }

    const payload = this.verifyRefreshToken(refreshTok);
    if (!payload) {
      throw new HttpException('Рефрештокен не прошёл валидацию', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersService.getUserByLogin(payload.login);
    const tokens = await this.generateTokens(user);
    return {id: user.id, login: user.login, tokens, avatar: user.avatar};
  }

  async logout(userId: number) {
    const user = await this.usersService.getUserById(userId, {});
    const refreshToken = await this.refreshTokRep.findOneBy({
      user: {
        id: user.id,
      },
    });
    await this.refreshTokRep.remove(refreshToken);
  }

  private async generateTokens(user: User): Promise<Tokens> {
    const payload: TokenPayload = {
      id: user.id,
      login: user.login,
    }
    const accessToken = jwt.sign(payload, 'accessKey', {expiresIn: '30m'});
    const refreshToken = jwt.sign(payload, 'refreshKey', {expiresIn: '12h'});
    return {accessToken, refreshToken}; 
  }

  private verifyRefreshToken(refreshToken: string): TokenPayload | null {
    try {
      const payload: TokenPayload = jwt.verify(refreshToken, 'refreshKey');
      return payload;
    } catch (error) {
      return null;
    }
  }
}
