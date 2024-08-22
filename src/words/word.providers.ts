import { DataSource } from "typeorm";
import { Word } from "./word.entity";
import { UserWord } from "./user-word.entity";
// import { TodayWord } from "./today-word.entity";

export const wordProviders = [
  {
    provide: 'WORD_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Word),
    inject: ['FUCKING_SOURSE'],
  },
  {
    provide: 'USER_WORD_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserWord),
    inject: ['FUCKING_SOURSE'],
  },
  // {
  //   provide: 'TODAY_WORD_REPOSITORY',
  //   useFactory: (dataSource: DataSource) => dataSource.getRepository(TodayWord),
  //   inject: ['FUCKING_SOURSE'],
  // },
];