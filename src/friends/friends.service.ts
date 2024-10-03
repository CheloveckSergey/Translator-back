import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { And, In, Not, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { FriendRequest, FriendRequestStatus } from './request.entity';
import { mapFindFriendDto, mapFriendDto, mapIncomeRequestDto, mapOutomeRequestDto } from './dto/mappers';
import { FindFriendDto, FriendDto } from './dto/dto';
import { GetFindFriendsQuery, GetFriendsQuery, GetIncomeRequestsQuery, GetOutcomeRequestsQuery } from './dto/query';

@Injectable()
export class FriendsService {

  constructor(
    @Inject('USER_REPOSITORY') 
    private userRepository: Repository<User>,
    @Inject('FRIEND_REQUEST_REPOSITORY') 
    private frRequestRep: Repository<FriendRequest>,
  ) {}

  async getFriends(query: GetFriendsQuery): Promise<FriendDto[]> {
    const user = await this.userRepository.findOne({
      where: {
        id: query.userId,
      },
      relations: {
        friends: true,
      }
    });
    return user.friends.map(mapFriendDto)
  }

  async getFindFriends(query: GetFindFriendsQuery): Promise<FindFriendDto[]> {
    const meUser = await this.userRepository.findOne({
      where: {
        id: query.userId,
      },
      relations: {
        friends: true,
        toRequests: {
          fromUser: true,
        },
        fromRequests: {
          toUser: true,
        }
      },
    });

    const friendIds = meUser.friends.map(user => user.id);
    const toUserIds = meUser.fromRequests.map(request => request.toUser.id);
    const fromUserIds = meUser.toRequests.map(request => request.fromUser.id);

    const users = await this.userRepository.find({
      where: {
        id: And(
          Not(query.userId),
          Not(In(friendIds)),
          Not(In(toUserIds)), 
          Not(In(fromUserIds)), 
        ),
      }
    });
    return users.map(mapFindFriendDto)
  }

  async getIncomeRequests(query: GetIncomeRequestsQuery) {
    const requests = await this.frRequestRep.find({
      where: {
        toUser: {
          id: query.userId,
        },
        status: Not(FriendRequestStatus.ACCEPTED),
      },
      relations: {
        fromUser: true,
      }
    });
    return requests.map(mapIncomeRequestDto)
  }

  async getOutcomeRequests(query: GetOutcomeRequestsQuery) {
    const requests = await this.frRequestRep.find({
      where: {
        fromUser: {
          id: query.userId,
        },
        status: Not(FriendRequestStatus.ACCEPTED),
      },
      relations: {
        toUser: true,
      }
    });
    return requests.map(mapOutomeRequestDto)
  }

  async sendRequest(fromUserId: number, toUserId: number) {
    const fromUser = await this.userRepository.findOneBy({ id: fromUserId });
    const toUser = await this.userRepository.findOneBy({ id: toUserId });

    const newRequest = new FriendRequest();
    newRequest.fromUser = fromUser;
    newRequest.toUser = toUser;
    await this.frRequestRep.save(newRequest);

    return newRequest;
  }

  async rejectRequest(fromUserId: number, toUserId: number) {
    const request = await this.frRequestRep.findOne({
      where: {
        fromUser: {
          id: fromUserId,
        },
        toUser: {
          id: toUserId,
        }
      },
    });

    request.status = FriendRequestStatus.REJECTED;
    await this.frRequestRep.save(request);
    return { message: 'Request has been rejected. Friendship has not been made!' }
  }

  async acceptRequest(fromUserId: number, toUserId: number) {
    const request = await this.frRequestRep.findOne({
      where: {
        fromUser: {
          id: fromUserId,
        },
        toUser: {
          id: toUserId,
        }
      },
      relations: {
        fromUser: true,
        toUser: true,
      }
    });

    await this.createFriendship(request.fromUser.id, request.toUser.id);

    request.status = FriendRequestStatus.ACCEPTED;
    await this.frRequestRep.save(request);
    return { message: 'Request has been accepted. Friendship has been made!' }
  }

  async createFriendship(userId1: number, userId2: number) {
    const user1 = await this.userRepository.findOne({
      where: {
        id: userId1,
      },
      relations: {
        friends: true,
      }
    });

    const user2 = await this.userRepository.findOne({
      where: {
        id: userId2,
      },
      relations: {
        friends: true,
      }
    });

    user1.friends.push(user2);
    user2.friends.push(user1);
    await this.userRepository.save(user1);
    await this.userRepository.save(user2);
    return { message: 'Friendship OK' }
  }

  async cancelRequest(fromUserId: number, toUserId: number) {
    const request = await this.frRequestRep.findOne({
      where: {
        fromUser: {
          id: fromUserId,
        },
        toUser: {
          id: toUserId,
        }
      }
    });

    if (!request) {
      throw new HttpException('Такой заявки не существует', HttpStatus.BAD_REQUEST)
    }

    await this.frRequestRep.delete(request);

    return { message: 'Request has been deleted' }
  }

  async deleteFriend(fromUserId: number, toUserId: number) {
    const fromUser = await this.userRepository.findOne({
      where: {
        id: fromUserId,
      },
      relations: {
        friends: true,
      }
    });
    const toUser =await this.userRepository.findOne({
      where: {
        id: toUserId,
      },
      relations: {
        friends: true,
      }
    });

    const request1 = await this.frRequestRep.findOneBy({
      fromUser: fromUser,
      toUser: toUser,
    });
    const request2 = await this.frRequestRep.findOneBy({
      fromUser: toUser,
      toUser: fromUser,
    });

    if (request1) {
      await this.frRequestRep.delete(request1)
    }
    
    if (request2) {
      await this.frRequestRep.delete(request2)
    }

    fromUser.friends = fromUser.friends.filter(friend => friend.id !== toUser.id);
    toUser.friends = toUser.friends.filter(friend => friend.id !== fromUser.id);
    await this.userRepository.save(fromUser);
    await this.userRepository.save(toUser);

    return { message: 'Friendship has been deleted' }
  }

  async cancelDeleteFriend(userId1: number, userId2: number) {
    await this.createFriendship(userId1, userId2);
    return { message: 'adsfasdf' }
  }
}
