import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { authProviders } from './auth.providers';
import { UsersModule } from 'src/users/users.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    ...authProviders,
  ],
  imports: [
    UsersModule,
    DatabaseModule,
  ]
})
export class AuthModule {}
