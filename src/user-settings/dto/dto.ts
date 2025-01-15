import { PrivacySettings } from "../user-setting.entity";

export interface UserSettingsDto {
  id: number,
  textsPrivacy: PrivacySettings,
  wordsPrivacy: PrivacySettings,
  pagePrivacy: PrivacySettings,
  createdDate: Date,
  updatedDate: Date,
}