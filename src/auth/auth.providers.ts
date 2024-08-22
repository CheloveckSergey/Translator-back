import { DataSource } from "typeorm";
import { RefreshToken } from "./refreshToken.entity";

export const authProviders = [
  {
    provide: 'REFRESH_TOKEN_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(RefreshToken),
    inject: ['FUCKING_SOURSE'],
  },
];