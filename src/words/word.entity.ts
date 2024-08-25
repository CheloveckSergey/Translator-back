import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserWord } from "./user-word.entity";
import { Translation } from "./translation.entity";
// import { TodayWord } from "./today-word.entity";

@Entity({
  name: 'words',
})
export class Word {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  value: string;

  @OneToMany(() => UserWord, (userWord) => userWord.word)
  userWords: UserWord[];

  @OneToOne(() => Translation, (translation) => translation.word)
  translation: Translation;
}