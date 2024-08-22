import { Module } from '@nestjs/common';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { wordProviders } from './word.providers';
import { DatabaseModule } from 'src/database/database.module';
import { TranslatorApiModule } from 'src/translator-api/translator-api.module';
import { userProviders } from 'src/users/user.providers';

@Module({
  controllers: [WordsController],
  imports: [
    DatabaseModule,
    TranslatorApiModule,
  ],
  providers: [
    ...wordProviders,
    ...userProviders,
    WordsService
  ]
})
export class WordsModule {}
