import { Inject, Injectable } from '@nestjs/common';
import { Word } from 'src/words/word.entity';
import { Repository } from 'typeorm';
import { User } from './user.entity';

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
  
  async getUserById(id: number) {
    const user = await this.userRepository.findOneBy({
      id,
    })
    return user;
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
