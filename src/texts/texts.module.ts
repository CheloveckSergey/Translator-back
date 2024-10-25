import { Module } from '@nestjs/common';
import { TextsController } from './texts.controller';
import { TextsService } from './texts.service';
import { textProviders } from './texts.providers';
import { DatabaseModule } from 'src/database/database.module';
import { userProviders } from 'src/users/user.providers';
import { wordProviders } from 'src/words/word.providers';
import { TranslatorApiModule } from 'src/translator-api/translator-api.module';
import { WordsModule } from 'src/words/words.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  controllers: [TextsController],
  providers: [
    TextsService,
    ...textProviders,
    ...userProviders,
    ...wordProviders,
  ],
  imports: [
    DatabaseModule,
    TranslatorApiModule,
    WordsModule,
    FriendsModule,
  ],
})
export class TextsModule {}
