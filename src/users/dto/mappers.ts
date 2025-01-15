import { User } from "../user.entity";
import { SentRequestStatus, UserDto } from "./dto";
import { UserQuery } from "./query";

export function mapUserDto(user: User, query?: UserQuery): UserDto {
  const userDto: UserDto = {
    id: user.id,
    login: user.login,
    avatar: user.avatar,
    isFriend: false,
    isSentRequest: undefined,
  }

  if (query?.meUserId) {
    if (user.friends.find(user => user.id === query.meUserId)) {
      userDto.isFriend = true;
    } else {
      if (user.fromRequests.find(request => request.toUser.id === query.meUserId)) {
        userDto.isSentRequest = 'sentFrom'
      } else if (user.toRequests.find(request => request.fromUser.id === query.meUserId)) {
        userDto.isSentRequest = 'sentTo';
      }
    }
  }

  if (query?.wordsNumber) {
    userDto.wordsNumber = user.userWords.length;
  }

  return userDto;
}