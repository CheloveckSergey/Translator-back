import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'FUCKING_SOURSE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'David_2102',
        database: 'translator1',
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];