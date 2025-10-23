import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { CreateWalletDto, DepositDto, WithdrawDto } from './dto/wallet.dto';
import { TransactionType, TransactionStatus } from '../../common/enums/transaction.enum';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createWallet(userId: string, createWalletDto: CreateWalletDto) {
    const existingWallet = await this.walletRepository.findOne({
      where: {
        userId,
        cryptoType: createWalletDto.cryptoType,
      },
    });

    if (existingWallet) {
      throw new BadRequestException(
        `Wallet for ${createWalletDto.cryptoType} already exists`,
      );
    }

    // TODO: Integrate with blockchain for real address generation
    const address = this.generateMockAddress(createWalletDto.cryptoType);

    const wallet = this.walletRepository.create({
      ...createWalletDto,
      userId,
      address,
      balance: 0,
    });

    return await this.walletRepository.save(wallet);
  }

  async getUserWallets(userId: string) {
    return await this.walletRepository.find({
      where: { userId, isActive: true },
      relations: ['transactions'],
      order: { createdAt: 'DESC' },
    });
  }

  async getWalletById(id: string, userId: string) {
    const wallet = await this.walletRepository.findOne({
      where: { id, userId },
      relations: ['transactions'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async deposit(walletId: string, userId: string, depositDto: DepositDto) {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      amount: depositDto.amount,
      cryptoType: wallet.cryptoType,
      toAddress: wallet.address,
      txHash: `0x${randomUUID().replace(/-/g, '')}`,
      description: 'Deposit to wallet',
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    wallet.balance = Number(wallet.balance) + depositDto.amount;
    const updatedWallet = await this.walletRepository.save(wallet);

    return {
      message: 'Deposit successful',
      transaction: savedTransaction,
      newBalance: updatedWallet.balance,
    };
  }

  async withdraw(walletId: string, userId: string, withdrawDto: WithdrawDto) {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (Number(wallet.balance) < withdrawDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.PENDING,
      amount: withdrawDto.amount,
      cryptoType: wallet.cryptoType,
      fromAddress: wallet.address,
      toAddress: withdrawDto.toAddress,
      txHash: `0x${randomUUID().replace(/-/g, '')}`,
      description: 'Withdrawal from wallet',
      fee: withdrawDto.amount * 0.001, // 0.1% fee
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    wallet.balance = Number(wallet.balance) - withdrawDto.amount - savedTransaction.fee;
    const updatedWallet = await this.walletRepository.save(wallet);

    // Async blockchain confirmation
    setTimeout(async () => {
      savedTransaction.status = TransactionStatus.COMPLETED;
      await this.transactionRepository.save(savedTransaction);
    }, 3000);

    return {
      message: 'Withdrawal initiated',
      transaction: savedTransaction,
      newBalance: updatedWallet.balance,
    };
  }

  async getWalletTransactions(walletId: string, userId: string) {
    const wallet = await this.getWalletById(walletId, userId);

    return await this.transactionRepository.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
    });
  }

  private generateMockAddress(cryptoType: string): string {
    const prefix = cryptoType === 'BTC' ? '1' : '0x';
    return `${prefix}${randomUUID().replace(/-/g, '').substring(0, 40)}`;
  }
}
