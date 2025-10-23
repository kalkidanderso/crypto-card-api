import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CardStatus, CardType } from '../../../common/enums/card-status.enum';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  cardNumber: string;

  @Column()
  cardHolderName: string;

  @Column({ type: 'enum', enum: CardType })
  cardType: CardType;

  @Column({ type: 'enum', enum: CardStatus, default: CardStatus.PENDING })
  status: CardStatus;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  spendingLimit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentSpending: number;

  @Column({ default: 'USD' })
  currency: string;

  @ManyToOne(() => User, (user) => user.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
