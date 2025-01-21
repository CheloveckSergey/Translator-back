import { UsualQuery } from "src/shared/types";

export interface FriendRequestQuery extends UsualQuery {
  userId: number,
  wordsNumber?: boolean,
}

export interface GetFriendsQuery extends FriendRequestQuery {}

export interface GetFindFriendsQuery extends FriendRequestQuery {}

export interface GetIncomeRequestsQuery extends FriendRequestQuery {}

export interface GetOutcomeRequestsQuery extends FriendRequestQuery {}