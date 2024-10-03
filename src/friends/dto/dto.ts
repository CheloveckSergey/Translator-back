import { FriendRequestStatus } from "../request.entity";

export interface FriendDto {
  id: number;
  login: string;
}

export interface FindFriendDto {
  id: number;
  login: string;
}

export interface IncomeRequestUserDto {
  id: number,
  login: string,
  status: FriendRequestStatus,
}

export interface OutcomeRequestUserDto {
  id: number,
  login: string,
  status: FriendRequestStatus,
}