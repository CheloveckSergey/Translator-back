import { User } from "src/users/user.entity"
import { FindFriendDto, FriendDto, IncomeRequestUserDto, OutcomeRequestUserDto } from "./dto"
import { FriendRequest } from "../request.entity"

export function mapFriendDto(user: User): FriendDto {
  const friendDto: FriendDto = {
    id: user.id,
    login: user.login,
  }
  return friendDto
}

export function mapFindFriendDto(user: User): FindFriendDto {
  const findFriendDto: FindFriendDto = {
    id: user.id,
    login: user.login,
  }
  return findFriendDto
}

export function mapIncomeRequestDto(request: FriendRequest): IncomeRequestUserDto {
  const dto: IncomeRequestUserDto = {
    id: request.fromUser.id,
    login: request.fromUser.login,
    status: request.status,
  }
  return dto
}

export function mapOutomeRequestDto(request: FriendRequest): OutcomeRequestUserDto {
  const dto: OutcomeRequestUserDto = {
    id: request.toUser.id,
    login: request.toUser.login,
    status: request.status,
  }
  return dto
}