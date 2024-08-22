import { Module } from '@nestjs/common';
import { TranslatorApiService } from './translator-api.service';

@Module({
  providers: [TranslatorApiService],
  exports: [
    TranslatorApiService,
  ]
})
export class TranslatorApiModule {}
