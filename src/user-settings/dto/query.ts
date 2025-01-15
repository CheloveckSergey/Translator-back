import { z } from "zod";
import { PrivacySettings } from "../user-setting.entity";

export interface ChangeUserSettingReqDto {
  textsPrivacy?: PrivacySettings | undefined,
  wordsPrivacy?: PrivacySettings | undefined,
  pagePrivacy?: PrivacySettings | undefined,
  userId: number,
}

const PrivacySetting = z.enum(['onlyMe', 'onlyFriends', 'all']);

export const changeUserSettingSchema = z
  .object({
    textsPrivacy: z.union([PrivacySetting, z.undefined()]),
    wordsPrivacy: z.union([PrivacySetting, z.undefined()]),
    pagePrivacy: z.union([PrivacySetting, z.undefined()]),
    userId: z.number(),
  })
  .required();

export type changeUserSettingDto = z.infer<typeof changeUserSettingSchema>;