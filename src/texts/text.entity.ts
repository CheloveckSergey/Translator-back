import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}