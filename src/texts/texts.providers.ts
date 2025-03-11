import { DataSource } from "typeorm";
import { Text } from "./text.entity";
import { TextBlock } from "./block.entity";

export const textProviders = [
  {
    provide: 'TEXT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Text),
    inject: ['FUCKING_SOURSE'],
  },
  {
    provide: 'TEXT_BLOCK_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(TextBlock),
    inject: ['FUCKING_SOURSE'],
  },
];