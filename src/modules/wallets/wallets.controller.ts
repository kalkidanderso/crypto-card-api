import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CreateWalletDto, DepositDto, WithdrawDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wallets')
@Controller('wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new crypto wallet' })
  @ApiResponse({ status: 201, description: 'Wallet successfully created' })
  @ApiResponse({ status: 400, description: 'Wallet already exists' })
  async createWallet(@CurrentUser() user: any, @Body() createWalletDto: CreateWalletDto) {
    return this.walletsService.createWallet(user.id, createWalletDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user wallets' })
  @ApiResponse({ status: 200, description: 'Returns all user wallets' })
  async getUserWallets(@CurrentUser() user: any) {
    return this.walletsService.getUserWallets(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet by ID' })
  @ApiResponse({ status: 200, description: 'Returns wallet details' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getWalletById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.walletsService.getWalletById(id, user.id);
  }

  @Post(':id/deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deposit funds to wallet' })
  @ApiResponse({ status: 200, description: 'Deposit successful' })
  async deposit(@Param('id') id: string, @CurrentUser() user: any, @Body() depositDto: DepositDto) {
    return this.walletsService.deposit(id, user.id, depositDto);
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  @ApiResponse({ status: 200, description: 'Withdrawal initiated' })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  async withdraw(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() withdrawDto: WithdrawDto,
  ) {
    return this.walletsService.withdraw(id, user.id, withdrawDto);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiResponse({ status: 200, description: 'Returns wallet transactions' })
  async getWalletTransactions(@Param('id') id: string, @CurrentUser() user: any) {
    return this.walletsService.getWalletTransactions(id, user.id);
  }
}
