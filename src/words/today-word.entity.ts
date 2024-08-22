import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Word } from "./word.entity";
import { User } from "src/users/user.entity";
import { UserWord } from "./user-word.entity";

// @Entity({
//   name: 'today-words',
// })
// export class TodayWord {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   check: boolean;

//   @UpdateDateColumn()
//   updateDate: Date;

//   @CreateDateColumn()
//   createDate: Date;

//   @OneToOne(() => UserWord, (userWord) => userWord.todayWord)
//   @JoinColumn()
//   userWord: Word;

//   @ManyToOne(() => User, (user) => user.todayWords)
//   user: User;
// }