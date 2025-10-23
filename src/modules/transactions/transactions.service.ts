import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionType, TransactionStatus } from '../../common/enums/transaction.enum';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactionRepository.create(transactionData);
    return this.transactionRepository.save(transaction);
  }

  async findAll(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { wallet: { userId } },
      relations: ['wallet'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByWallet(walletId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, wallet: { userId } },
      relations: ['wallet'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async getStats(userId: string) {
    const transactions = await this.findAll(userId);

    const totalDeposits = transactions
      .filter(t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.COMPLETED)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalWithdrawals = transactions
      .filter(t => t.type === TransactionType.WITHDRAWAL && t.status === TransactionStatus.COMPLETED)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const pendingCount = transactions
      .filter(t => t.status === TransactionStatus.PENDING).length;

    return {
      totalTransactions: transactions.length,
      totalDeposits,
      totalWithdrawals,
      pendingCount,
      completedCount: transactions.filter(t => t.status === TransactionStatus.COMPLETED).length,
      failedCount: transactions.filter(t => t.status === TransactionStatus.FAILED).length,
    };
  }
}
