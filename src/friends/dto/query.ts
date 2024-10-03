export interface GetFriendsQuery {
  limit?: number,
  offset?: number,
  userId: number,
  order: 'ASC' | 'DESC',
}

export interface GetFindFriendsQuery {
  limit?: number,
  offset?: number,
  userId: number,
  order: 'ASC' | 'DESC',
}

export interface GetFUsersQuery {
  limit?: number,
  offset?: number,
  friendsUserId?: number,
  unfriendsUserId?: number,
  order: 'ASC' | 'DESC',
}

export interface GetRequestsQuery {
  limit?: number,
  offset?: number,
  userId: number,
  type: 'from' | 'to',
  order: 'ASC' | 'DESC',
}

export interface GetIncomeRequestsQuery {
  limit?: number,
  offset?: number,
  userId: number,
  order: 'ASC' | 'DESC',
}

export interface GetOutcomeRequestsQuery {
  limit?: number,
  offset?: number,
  userId: number,
  order: 'ASC' | 'DESC',
}