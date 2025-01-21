import { FriendRequest } from "src/friends/request.entity";
import { UserWord } from "src/words/user-word.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Text } from "src/texts/text.entity";

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  login: string;

  @Column({ length: 500})
  password: string;

  @Column({ length: 200, nullable: true })
  avatar: string | undefined;

  @OneToMany(() => UserWord, (userWord) => userWord.user)
  userWords: UserWord[];

  @ManyToMany(() => User)
  @JoinTable()
  friends: User[];

  @OneToMany(() => FriendRequest, (request) => request.fromUser)
  fromRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (request) => request.toUser)
  toRequests: FriendRequest[];

  @OneToMany(() => Text, (text) => text.user)
  texts: Text[];

  @ManyToMany(() => Text, (text) => text.copyUsers)
  copyTexts: Text[];
}