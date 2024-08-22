import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserWord } from "./user-word.entity";
// import { TodayWord } from "./today-word.entity";

@Entity({
  name: 'words',
})
export class Word {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  value: string;

  @Column({ length: 100 })
  translation: string;

  @OneToMany(() => UserWord, (userWord) => userWord.word)
  userWords: UserWord[];

  // @OneToOne(() => TodayWord, (todayWord) => todayWord.word)
  // todayWord: TodayWord;
}