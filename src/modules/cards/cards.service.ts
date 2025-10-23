import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';
import { CardStatus } from '../../common/enums/card-status.enum';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  async create(userId: string, createCardDto: CreateCardDto, user: any): Promise<Card> {
    // Generate mock card number (last 4 digits shown)
    const cardNumber = this.generateCardNumber();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);

    const cardHolderName = `${user.firstName} ${user.lastName}`.toUpperCase();

    const card = this.cardRepository.create({
      ...createCardDto,
      cardNumber,
      cardHolderName,
      expiryDate,
      userId,
      status: CardStatus.PENDING,
    });

    return this.cardRepository.save(card);
  }

  async findAll(userId: string): Promise<Card[]> {
    return this.cardRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id, userId },
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return card;
  }

  async update(
    id: string,
    userId: string,
    updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    const card = await this.findOne(id, userId);

    if (updateCardDto.spendingLimit !== undefined) {
      if (updateCardDto.spendingLimit < card.currentSpending) {
        throw new BadRequestException(
          'Spending limit cannot be lower than current spending',
        );
      }
    }

    await this.cardRepository.update(id, updateCardDto);
    return this.findOne(id, userId);
  }

  async activate(id: string, userId: string): Promise<Card> {
    const card = await this.findOne(id, userId);

    if (card.status === CardStatus.ACTIVE) {
      throw new BadRequestException('Card is already active');
    }

    if (card.status === CardStatus.BLOCKED) {
      throw new BadRequestException('Blocked cards cannot be activated');
    }

    card.status = CardStatus.ACTIVE;
    return this.cardRepository.save(card);
  }

  async block(id: string, userId: string): Promise<Card> {
    const card = await this.findOne(id, userId);

    if (card.status === CardStatus.BLOCKED) {
      throw new BadRequestException('Card is already blocked');
    }

    card.status = CardStatus.BLOCKED;
    return this.cardRepository.save(card);
  }

  async remove(id: string, userId: string): Promise<void> {
    const card = await this.findOne(id, userId);
    await this.cardRepository.remove(card);
  }

  private generateCardNumber(): string {
    // Generate a mock 16-digit card number
    const prefix = '4532'; // Visa test prefix
    const middle = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    const last = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${prefix}${middle}${last}`;
  }
}
