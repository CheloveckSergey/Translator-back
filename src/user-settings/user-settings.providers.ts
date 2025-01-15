import { DataSource } from "typeorm";
import { UserSetting } from "./user-setting.entity";

export const userSettingProviders = [
  {
    provide: 'USER_SETTING_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserSetting),
    inject: ['FUCKING_SOURSE'],
  },
];