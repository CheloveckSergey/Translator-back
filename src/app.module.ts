import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { WordsModule } from './words/words.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TextsModule } from './texts/texts.module';
import { TranslatorApiModule } from './translator-api/translator-api.module';
import { FriendsModule } from './friends/friends.module';
import { ServiceModule } from './service/service.module';
import { UserSettingsModule } from './user-settings/user-settings.module';

@Module({
  imports: [DatabaseModule, WordsModule, UsersModule, AuthModule, TextsModule, TranslatorApiModule, FriendsModule, ServiceModule, UserSettingsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
