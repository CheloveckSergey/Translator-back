import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TextBlock } from "./block.entity";

@Entity({
  name: 'texts',
})
export class Text {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 200,
  })
  name: string;

  @Column({
    default: false,
  })
  premiere: boolean;

  @OneToMany(() => TextBlock, (block) => block.text)
  blocks: TextBlock[];

  @ManyToOne(() => User, (user) => user.texts)
  @JoinColumn()
  user: User;

  @ManyToMany(() => User, (user) => user.copyTexts)
  @JoinTable()
  copyUsers: User[];

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}