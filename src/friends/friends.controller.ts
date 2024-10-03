import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TokenPayload } from 'src/auth/dto';
import { GetFindFriendsQuery, GetFriendsQuery, GetIncomeRequestsQuery, GetOutcomeRequestsQuery } from './dto/query';

@Controller('friends')
export class FriendsController {

  constructor(
    private friendsService: FriendsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/getFriends')
  async getFriends(
    @Req() req: { userPayload: TokenPayload },
    @Query() query: GetFriendsQuery,
  ) {
    return this.friendsService.getFriends(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getFindFriends')
  async getFindFriends(
    @Req() req: { userPayload: TokenPayload },
    @Query() query: GetFindFriendsQuery,
  ) {
    return this.friendsService.getFindFriends(query);
  }


  @UseGuards(JwtAuthGuard)
  @Get('/getIncomeRequests')
  async getIncomeRequests(
    @Req() req: { userPayload: TokenPayload },
    @Query() query: GetIncomeRequestsQuery,
  ) {
    return this.friendsService.getIncomeRequests(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getOutcomeRequests')
  async getOutcomeRequests(
    @Req() req: { userPayload: TokenPayload },
    @Query() query: GetOutcomeRequestsQuery,
  ) {
    return this.friendsService.getOutcomeRequests(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/sendRequest')
  async sendRequest(
    @Req() req: { userPayload: TokenPayload },
    @Body() dto: { fromUserId: number, toUserId: number },
  ) {
    return this.friendsService.sendRequest(dto.fromUserId, dto.toUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/rejectRequest')
  async rejectRequest(
    @Req() req: { userPayload: TokenPayload },
    @Body() dto: { fromUserId: number, toUserId: number },
  ) {
    return this.friendsService.rejectRequest(dto.fromUserId, dto.toUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/acceptRequest')
  async acceptRequest(
    @Req() req: { userPayload: TokenPayload },
    @Body() dto: { fromUserId: number, toUserId: number },
  ) {
    return this.friendsService.acceptRequest(dto.fromUserId, dto.toUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/cancelRequest')
  async cancelRequest(
    @Req() req: { userPayload: TokenPayload },
    @Body() dto: { fromUserId: number, toUserId: number },
  ) {
    return this.friendsService.cancelRequest(dto.fromUserId, dto.toUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/deleteFriend')
  async deleteFriend(
    @Req() req: { userPayload: TokenPayload },
    @Body() dto: { fromUserId: number, toUserId: number },
  ) {
    return this.friendsService.deleteFriend(dto.fromUserId, dto.toUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/cancelDeleteFriend')
  async cancelDeleteFriend(
    @Req() req: { userPayload: TokenPayload },
    @Body() dto: { userId1: number, userId2: number },
  ) {
    return this.friendsService.cancelDeleteFriend(dto.userId1, dto.userId2);
  }
}