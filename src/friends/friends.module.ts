import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { userProviders } from 'src/users/user.providers';
import { friendProviders } from './friend.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [FriendsController],
  imports: [
    DatabaseModule,
  ],
  providers: [
    FriendsService,
    ...userProviders,
    ...friendProviders,
  ]
})
export class FriendsModule {}
