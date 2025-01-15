import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum PrivacySettings {
  ONLY_ME = 'onlyMe',
  ONLY_FRIENDS = 'onlyFriends',
  ALL = 'all',
} 

@Entity({
  name: 'user_settings',
})
export class UserSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PrivacySettings,
    default: PrivacySettings.ALL,
  })
  textsPrivacy: PrivacySettings;

  @Column({
    type: 'enum',
    enum: PrivacySettings,
    default: PrivacySettings.ALL,
  })
  wordsPrivacy: PrivacySettings;

  @Column({
    type: 'enum',
    enum: PrivacySettings,
    default: PrivacySettings.ALL,
  })
  pagePrivacy: PrivacySettings;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}