import { DataSource } from "typeorm";
import { FriendRequest } from "./request.entity";

export const friendProviders = [
  {
    provide: 'FRIEND_REQUEST_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(FriendRequest),
    inject: ['FUCKING_SOURSE'],
  },
];