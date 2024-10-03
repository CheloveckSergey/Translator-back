import { User } from "src/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum FriendRequestStatus {
  WAITING = 'waiting',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity({
  name: 'friend_requests',
})
export class FriendRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: FriendRequestStatus,
    default: FriendRequestStatus.WAITING,
  })
  status: FriendRequestStatus;
  
  @ManyToOne(() => User, user => user.fromRequests)
  fromUser: User;

  @ManyToOne(() => User, user => user.fromRequests)
  toUser: User;
}