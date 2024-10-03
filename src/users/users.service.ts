import { Inject, Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { SentRequestStatus, UserDto } from './users.controller';

export function mapUserDto(user: User, meUserId: number): UserDto {
  let isFriend: boolean = false;

  if (user.friends.find(user => user.id === meUserId)) {
    isFriend = true;
  }

  if (isFriend) {
    const userDto: UserDto = {
      id: user.id,
      login: user.login,
      isFriend,
      isSentRequest: undefined,
    }
    return userDto;
  }

  let sentRequestStatus: SentRequestStatus;

  if (user.fromRequests.find(request => request.toUser.id === meUserId)) {
    sentRequestStatus = 'sentFrom';
  }

  if (user.toRequests.find(request => request.fromUser.id === meUserId)) {
    sentRequestStatus = 'sentTo';
  }

  const userDto: UserDto = {
    id: user.id,
    login: user.login,
    isFriend,
    isSentRequest: sentRequestStatus,
  }

  return userDto;
}

@Injectable()
export class UsersService {

  constructor(
    @Inject('USER_REPOSITORY') 
    private userRepository: Repository<User>,
  ) {}

  async getAllUsers() {
    const users = await this.userRepository.find();
    return users;
  }

  async getAllUsers1(meUserId: number): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      where: {
        id: Not(meUserId)
      },
      relations: {
        friends: true,
        toRequests: true,
        fromRequests: true,
      }
    });
    return users.map(user => mapUserDto(user, meUserId))
  }
  
  async getUserById(id: number, meUserId: number): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        friends: true,
        toRequests: {
          fromUser: true,
        },
        fromRequests: {
          toUser: true,
        },
      }
    })
    return mapUserDto(user, meUserId);
  }

  async getUserByLogin(login: string) {
    const user = await this.userRepository.findOneBy({
      login,
    })
    return user;
  }

  async createUser(dto: { login: string, password: string }) {
    const user = new User();
    user.login = dto.login,
    user.password = dto.password;
    await this.userRepository.save(user);
    
    const _user = await this.userRepository.findOneBy({ login : user.login});
    return _user;
  }
}
