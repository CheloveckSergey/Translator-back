import { User } from "src/users/user.entity"
import { FindFriendDto, FriendDto, IncomeRequestUserDto, OutcomeRequestUserDto } from "./dto"
import { FriendRequest } from "../request.entity"
import { GetFindFriendsQuery, GetFriendsQuery, GetIncomeRequestsQuery, GetOutcomeRequestsQuery } from "./query"

//Логики в query здесь пока нет, но не надо удалять, пожалуйста
export function mapFriendDto(user: User, query: GetFriendsQuery): FriendDto {
  const friendDto: FriendDto = {
    id: user.id,
    login: user.login,
    wordsNumber: user.userWords.length,
    avatar: user.avatar,
  }
  return friendDto
}

export function mapFindFriendDto(user: User, query:GetFindFriendsQuery): FindFriendDto {
  const findFriendDto: FindFriendDto = {
    id: user.id,
    login: user.login,
    wordsNumber: user.userWords.length,
    avatar: user.avatar,
  }
  return findFriendDto
}

export function mapIncomeRequestDto(request: FriendRequest, query: GetIncomeRequestsQuery): IncomeRequestUserDto {
  const dto: IncomeRequestUserDto = {
    id: request.fromUser.id,
    login: request.fromUser.login,
    status: request.status,
    wordsNumber: request.fromUser.userWords.length,
    avatar: request.fromUser.avatar,
  }
  return dto
}

export function mapOutomeRequestDto(request: FriendRequest, query: GetOutcomeRequestsQuery): OutcomeRequestUserDto {
  const dto: OutcomeRequestUserDto = {
    id: request.toUser.id,
    login: request.toUser.login,
    status: request.status,
    wordsNumber: request.toUser.userWords.length,
    avatar: request.toUser.avatar,
  }
  return dto
}