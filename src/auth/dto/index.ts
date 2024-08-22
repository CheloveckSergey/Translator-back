export interface Tokens {
  accessToken: string,
  refreshToken: string,
}

export interface RegDto {
  login: string,
  password: string,
}

export interface LogDto {
  login: string,
  password: string,
}

export interface AuthDto {
  id: number,
  login: string,
  tokens: Tokens;
}

export interface TokenPayload {
  id: number,
  login: string,
}

export interface AuthResDto {
  id: number, 
  login: string, 
  accessToken: string,
}