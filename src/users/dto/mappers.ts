import { User } from "../user.entity";
import { SentRequestStatus, UserDto } from "./dto";
import { UserQuery } from "./query";

export function mapUserDto(user: User, query: UserQuery, meUserId?: number): UserDto {
  const userDto: UserDto = {
    id: user.id,
    login: user.login,
    avatar: user.avatar,
    isFriend: false,
    isSentRequest: undefined,
  }

  if (query.friendship && meUserId) {
    if (user.friends.find(user => user.id === meUserId)) {
      userDto.isFriend = true;
    } else {
      if (user.fromRequests.find(request => request.toUser.id === meUserId)) {
        userDto.isSentRequest = 'sentFrom'
      } else if (user.toRequests.find(request => request.fromUser.id === meUserId)) {
        userDto.isSentRequest = 'sentTo';
      }
    }
  }

  if (query?.wordsNumber) {
    userDto.wordsNumber = user.userWords.length;
  }

  return userDto;
}