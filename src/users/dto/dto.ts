export type SentRequestStatus = 'sentTo' | 'sentFrom' | undefined;

export interface UserDto {
  id: number;
  login: string;
  avatar: string | null;
  isFriend: boolean;
  isSentRequest: SentRequestStatus;
}