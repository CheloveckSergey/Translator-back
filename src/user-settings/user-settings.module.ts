import { Module } from '@nestjs/common';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';
import { DatabaseModule } from 'src/database/database.module';
import { userSettingProviders } from './user-settings.providers';
import { FriendsModule } from 'src/friends/friends.module';
import { userProviders } from 'src/users/user.providers';

@Module({
  controllers: [UserSettingsController],
  providers: [
    UserSettingsService,
    ...userSettingProviders,
    ...userProviders,
  ],
  imports: [
    DatabaseModule,
    FriendsModule,
  ],
  exports: [
    UserSettingsService,
  ]
})
export class UserSettingsModule {}
