import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PrivacySettings, UserSetting } from './user-setting.entity';
import { FriendsService } from 'src/friends/friends.service';
import { User } from 'src/users/user.entity';
import { mapUserSettingsDto } from './dto/mappers';
import { UserSettingsDto } from './dto/dto';
import { ChangeUserSettingReqDto, changeUserSettingDto } from './dto/query';

@Injectable()
export class UserSettingsService {

  constructor(
    @Inject('USER_SETTING_REPOSITORY') 
    private userSettingRep: Repository<UserSetting>,
    @Inject('USER_REPOSITORY') 
    private userRepository: Repository<User>,
    private friendsService: FriendsService,
  ) {}

  async getSettings(userId: number, meUserId: number): Promise<UserSettingsDto> {
    if (meUserId !== userId) {
      throw new HttpException('Юзер и миюзер не совпадают', HttpStatus.FORBIDDEN)
    }

    const settings = await this.userSettingRep.findOne({
      where: {
        user: {
          id: userId,
        }
      }
    });
    return mapUserSettingsDto(settings);
  } 

  async checkTextsPrivacy(userId: number, meUserId?: number | undefined): Promise<boolean> {
    let setting = await this.userSettingRep.findOne({
      where: {
        user: {
          id: userId,
        }
      }
    });

    if (!setting) {
      setting = await this.createDefaultSetting(userId);
    }

    if (setting.textsPrivacy === PrivacySettings.ALL) {
      return true
    } else if (setting.textsPrivacy === PrivacySettings.ONLY_ME) {
      if (userId === meUserId) {
        return true
      } else {
        return false
      }
    } else if (setting.textsPrivacy === PrivacySettings.ONLY_FRIENDS) {
      if (!meUserId) {
        return false
      }

      const friends = await this.friendsService.getFriends({
        userId,
      });
      if (friends.find(friend => friend.id === meUserId)) {
        return true
      } else {
        return false
      }
    }

    return false
  }

  async createDefaultSetting(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new HttpException('Нет пользователя', HttpStatus.BAD_REQUEST)
    }

    const userSetting = await this.userSettingRep.create();
    userSetting.user = user;
    await this.userSettingRep.save(userSetting);

    const newUserSetting = await this.userSettingRep.findOneBy({ user: { id: userId } });
    return newUserSetting;
  }

  async changeSettings(dto: ChangeUserSettingReqDto, meUserId: number) {
    console.log(dto);
    if (meUserId !== dto.userId) {
      throw new HttpException('Юзер и миюзер не совпадают', HttpStatus.FORBIDDEN)
    }

    const user = await this.userRepository.findOneBy({ id: dto.userId });

    if (!user) {
      throw new HttpException('Нет пользователя', HttpStatus.BAD_REQUEST)
    }

    const settings = await this.userSettingRep.findOne({
      where: {
        user,
      }
    });

    if (dto.textsPrivacy) {
      settings.textsPrivacy = dto.textsPrivacy;
    }
    if (dto.wordsPrivacy) {
      settings.wordsPrivacy = dto.wordsPrivacy;
    }
    if (dto.pagePrivacy) {
      settings.pagePrivacy = dto.pagePrivacy;
    }

    await this.userSettingRep.save(settings);

    return this.getSettings(dto.userId, meUserId)
  }
}
