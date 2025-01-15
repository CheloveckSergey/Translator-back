import { UserSetting } from "../user-setting.entity";
import { UserSettingsDto } from "./dto";

export function mapUserSettingsDto(setting: UserSetting): UserSettingsDto {
  const dto: UserSettingsDto = {
    id: setting.id,
    textsPrivacy: setting.textsPrivacy,
    wordsPrivacy: setting.wordsPrivacy,
    pagePrivacy: setting.pagePrivacy,
    createdDate: setting.createdDate,
    updatedDate: setting.updatedDate,
  }
  return dto;
}