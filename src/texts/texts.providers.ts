import { DataSource } from "typeorm";
import { Text } from "./text.entity";

export const textProviders = [
  {
    provide: 'TEXT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Text),
    inject: ['FUCKING_SOURSE'],
  },
];