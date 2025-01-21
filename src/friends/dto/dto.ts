import { FriendRequestStatus } from "../request.entity";

export interface GeneralFriendRequstDto {
  id: number,
  login: string,
  wordsNumber: number,
  avatar?: string | undefined,
}

export interface FriendDto extends GeneralFriendRequstDto {}

export interface FindFriendDto extends GeneralFriendRequstDto {}

export interface IncomeRequestUserDto extends GeneralFriendRequstDto {
  status: FriendRequestStatus,
}

export interface OutcomeRequestUserDto extends GeneralFriendRequstDto {
  status: FriendRequestStatus,
}