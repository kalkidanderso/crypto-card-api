import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cards')
@ApiBearerAuth('JWT-auth')
@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Request a new crypto card' })
  create(@CurrentUser() user: any, @Body() createCardDto: CreateCardDto) {
    return this.cardsService.create(user.id, createCardDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user cards' })
  findAll(@CurrentUser('id') userId: string) {
    return this.cardsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get card by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.cardsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update card settings' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardsService.update(id, userId, updateCardDto);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a card' })
  activate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.cardsService.activate(id, userId);
  }

  @Post(':id/block')
  @ApiOperation({ summary: 'Block a card' })
  block(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.cardsService.block(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a card' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.cardsService.remove(id, userId);
  }
}
