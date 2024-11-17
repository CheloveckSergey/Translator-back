import { User } from "../user.entity";
import { SentRequestStatus, UserDto } from "./dto";

export function mapUserDto(user: User, meUserId?: number): UserDto {
  const userDto: UserDto = {
    id: user.id,
    login: user.login,
    avatar: user.avatar,
    isFriend: false,
    isSentRequest: undefined,
  }

  if (!meUserId) {
    return userDto;
  }

  if (user.friends.find(user => user.id === meUserId)) {
    userDto.isFriend = true;
  } else {
    if (user.fromRequests.find(request => request.toUser.id === meUserId)) {
      userDto.isSentRequest = 'sentFrom'
    } else if (user.toRequests.find(request => request.fromUser.id === meUserId)) {
      userDto.isSentRequest = 'sentTo';
    }
  }

  return userDto;
}