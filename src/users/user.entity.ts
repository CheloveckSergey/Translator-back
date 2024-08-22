import { UserWord } from "src/words/user-word.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

  @OneToMany(() => UserWord, (userWord) => userWord.user)
  userWords: UserWord[];
}