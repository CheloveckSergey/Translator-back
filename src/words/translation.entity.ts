import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Word } from "./word.entity";

@Entity({
  name: 'translations',
})
export class Translation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  value: string;

  @OneToOne(() => Word, (word) => word.translation)
  @JoinColumn()
  word: Word;
}