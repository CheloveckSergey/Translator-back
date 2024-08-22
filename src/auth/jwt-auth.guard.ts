import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      console.log(token);
      if (bearer !== 'Bearer' || !token) {
        throw new HttpException('Пользователь не авторизован', HttpStatus.BAD_REQUEST);
      }
      const userPayload = jwt.verify(token, 'accessKey');
      req.userPayload = userPayload;
      return true
    } catch (error) {
      throw new HttpException('Пользователь не авторизован', HttpStatus.BAD_REQUEST);
    }
  }
}