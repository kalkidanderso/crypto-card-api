import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { CardType, CardStatus } from '../../../common/enums/card-status.enum';

export class CreateCardDto {
  @ApiProperty({ enum: CardType, example: CardType.VIRTUAL })
  @IsEnum(CardType)
  @IsNotEmpty()
  cardType: CardType;

  @ApiProperty({ example: 5000, description: 'Monthly spending limit in USD' })
  @IsNumber()
  @Min(100)
  @Max(100000)
  spendingLimit: number;
}

export class UpdateCardStatusDto {
  @ApiProperty({ enum: CardStatus })
  @IsEnum(CardStatus)
  @IsNotEmpty()
  status: CardStatus;
}

export class UpdateSpendingLimitDto {
  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(100)
  @Max(100000)
  spendingLimit: number;
}

export class UpdateCardDto {
  @ApiProperty({ example: 10000, required: false })
  @IsNumber()
  @Min(100)
  @Max(100000)
  spendingLimit?: number;
}
