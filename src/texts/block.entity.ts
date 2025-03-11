import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Text } from "./text.entity";

@Entity({
  name: 'text_blocks',
})
export class TextBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  original: string;

  @Column('text')
  translation: string;

  @Column()
  order: number;

  @ManyToOne(() => Text, (text) => text.blocks)
  @JoinColumn()
  text: Text;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}