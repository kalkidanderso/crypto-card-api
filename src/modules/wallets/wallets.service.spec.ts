import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { CryptoType } from '../../common/enums/transaction.enum';
import { TransactionType, TransactionStatus } from '../../common/enums/transaction.enum';
import { CreateWalletDto, DepositDto, WithdrawDto } from './dto/wallet.dto';

describe('WalletsService', () => {
  let service: WalletsService;

  const mockWallet = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'user-123',
    cryptoType: CryptoType.BTC,
    balance: 1.5,
    address: '1AbcDefGhIjKlMnOpQrStUvWxYz',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    transactions: [],
  };

  const mockTransaction = {
    id: 'tx-123',
    walletId: mockWallet.id,
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.COMPLETED,
    amount: 0.5,
    cryptoType: CryptoType.BTC,
    txHash: '0xabcdef123456',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWalletRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWallet', () => {
    const createWalletDto: CreateWalletDto = {
      cryptoType: CryptoType.BTC,
    };

    it('should successfully create a new wallet', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);
      mockWalletRepository.create.mockReturnValue(mockWallet);
      mockWalletRepository.save.mockResolvedValue(mockWallet);

      const result = await service.createWallet('user-123', createWalletDto);

      expect(result).toEqual(mockWallet);
      expect(mockWalletRepository.findOne).toHaveBeenCalled();
      expect(mockWalletRepository.create).toHaveBeenCalled();
      expect(mockWalletRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if wallet already exists', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      await expect(service.createWallet('user-123', createWalletDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserWallets', () => {
    it('should return all user wallets', async () => {
      const wallets = [mockWallet, { ...mockWallet, cryptoType: CryptoType.ETH }];
      mockWalletRepository.find.mockResolvedValue(wallets);

      const result = await service.getUserWallets('user-123');

      expect(result).toEqual(wallets);
      expect(mockWalletRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123', isActive: true },
        relations: ['transactions'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getWalletById', () => {
    it('should return a wallet by id', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.getWalletById(mockWallet.id, 'user-123');

      expect(result).toEqual(mockWallet);
      expect(mockWalletRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockWallet.id, userId: 'user-123' },
        relations: ['transactions'],
      });
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(service.getWalletById('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deposit', () => {
    const depositDto: DepositDto = {
      amount: 0.5,
    };

    it('should successfully deposit funds', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockWalletRepository.save.mockResolvedValue({
        ...mockWallet,
        balance: mockWallet.balance + depositDto.amount,
      });

      const result = await service.deposit(mockWallet.id, 'user-123', depositDto);

      expect(result).toHaveProperty('message', 'Deposit successful');
      expect(result).toHaveProperty('transaction');
      expect(result).toHaveProperty('newBalance');
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.DEPOSIT,
          amount: depositDto.amount,
        }),
      );
    });
  });

  describe('withdraw', () => {
    const withdrawDto: WithdrawDto = {
      amount: 0.5,
      toAddress: '1TargetAddress',
    };

    it('should successfully withdraw funds', async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepository.create.mockReturnValue({
        ...mockTransaction,
        type: TransactionType.WITHDRAWAL,
        fee: withdrawDto.amount * 0.001,
      });
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockWalletRepository.save.mockResolvedValue(mockWallet);

      const result = await service.withdraw(mockWallet.id, 'user-123', withdrawDto);

      expect(result).toHaveProperty('message', 'Withdrawal initiated');
      expect(result).toHaveProperty('transaction');
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.WITHDRAWAL,
          amount: withdrawDto.amount,
          toAddress: withdrawDto.toAddress,
        }),
      );
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      const poorWallet = { ...mockWallet, balance: 0.1 };
      mockWalletRepository.findOne.mockResolvedValue(poorWallet);

      await expect(
        service.withdraw(mockWallet.id, 'user-123', withdrawDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getWalletTransactions', () => {
    it('should return all wallet transactions', async () => {
      const transactions = [mockTransaction, { ...mockTransaction, id: 'tx-456' }];
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getWalletTransactions(mockWallet.id, 'user-123');

      expect(result).toEqual(transactions);
      expect(mockTransactionRepository.find).toHaveBeenCalledWith({
        where: { walletId: mockWallet.id },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
