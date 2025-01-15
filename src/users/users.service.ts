import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { FindOptionsRelationByString, FindOptionsRelations, Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { SentRequestStatus, UserDto } from './dto/dto';
import { mapUserDto } from './dto/mappers';
import { MyImage } from 'src/service/service.service';
import { UserQuery } from './dto/query';

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
    return users.map(user => mapUserDto(user))
  }
  
  async getUserById(id: number, query?: UserQuery, meUserId?: number): Promise<UserDto> {
    if (query?.meUserId && query?.meUserId !== meUserId) {
      throw new HttpException('Не совпадают ID пользователей', HttpStatus.UNAUTHORIZED)
    }

    let relations: FindOptionsRelations<User> = {}

    if (query?.meUserId) {
      relations.friends = true;
      relations.toRequests = {
        fromUser: true,
      };
      relations.fromRequests = {
        toUser: true,
      };
    }

    if (query?.wordsNumber) {
      relations.userWords = true;
    }

    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations,      
    });
    return mapUserDto(user, query);
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

  async updateAvatar(file: Express.Multer.File, meUserId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: meUserId,
      }
    });

    const image = new MyImage(file);
    image.save();

    try {
      user.avatar = image.name;
      await this.userRepository.save(user);
    } catch (e) {
      MyImage.delete(image.name);
      throw new HttpException('При создании аватара что-то пошло не так', 500);
    }

    return { image: image.name }
  }
}
