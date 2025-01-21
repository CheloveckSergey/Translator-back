import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

  @Column("text")
  content: string;

  @Column('text')
  translation: string;

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