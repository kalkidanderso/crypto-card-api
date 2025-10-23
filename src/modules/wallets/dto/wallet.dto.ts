import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { CryptoType } from '../../../common/enums/transaction.enum';

export class CreateWalletDto {
  @ApiProperty({ enum: CryptoType, example: CryptoType.USDT })
  @IsEnum(CryptoType)
  @IsNotEmpty()
  cryptoType: CryptoType;
}

export class DepositDto {
  @ApiProperty({ example: 100.50 })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;
}

export class WithdrawDto {
  @ApiProperty({ example: 50.25 })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' })
  @IsNotEmpty()
  toAddress: string;
}
