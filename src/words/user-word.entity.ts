import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Word } from "./word.entity";
import { User } from "src/users/user.entity";
// import { TodayWord } from "./today-word.entity";

export enum WordStatus {
  PROCESS = 'process',
  STUDIED = 'studied',
}

@Entity({
  name: 'user_words',
})
export class UserWord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: WordStatus,
    default: WordStatus.PROCESS,
  })
  status: WordStatus;

  @Column({
    default: 0,
  })
  quantity: number;

  @Column({
    nullable: true,
  })
  quantityUpdate: Date;

  @Column({
    default: false,
  })
  onList: boolean;

  @UpdateDateColumn()
  updateDate: Date;

  @CreateDateColumn()
  createDate: Date;

  @ManyToOne(() => Word, (word) => word.userWords)
  word: Word;

  @ManyToOne(() => User, (user) => user.userWords)
  user: User;

  // @OneToOne(() => TodayWord, (todayWord) => todayWord.userWord)
  // todayWord: TodayWord;
}