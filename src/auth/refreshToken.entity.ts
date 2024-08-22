import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'refresh_tokens',
})
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  value: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}