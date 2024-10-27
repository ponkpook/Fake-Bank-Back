import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { userAccount } from '../schemas/userAccount.schema';
import { transactionHistory } from '../schemas/transactionHistory.schema';
import { BPAYHistory } from '../schemas/BPAY.schema';
import { existingPayee } from '../schemas/existingPayee.schema';
import { RecurringPayment } from "../schemas/recurringPayments.schema";
import { TransferDto } from './dto/Transfer.dto';

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let userAccountModel: Model<userAccount>;
  let transactionHistoryModel: Model<transactionHistory>;
  let BPAYHistoryModel: Model<BPAYHistory>;
  let existingPayeeModel: Model<existingPayee>;
  let recurringPaymentModel: Model<RecurringPayment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(userAccount.name),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          },
        },
        {
          provide: getModelToken(transactionHistory.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          },
        },
        {
          provide: getModelToken(BPAYHistory.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          },
        },
        {
          provide: getModelToken(existingPayee.name),
          useValue: {},
        },
        {
          provide: getModelToken(RecurringPayment.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    userAccountModel = module.get<Model<userAccount>>(getModelToken(userAccount.name));
    transactionHistoryModel = module.get<Model<transactionHistory>>(getModelToken(transactionHistory.name));
    BPAYHistoryModel = module.get<Model<BPAYHistory>>(getModelToken(BPAYHistory.name));
    existingPayeeModel = module.get<Model<existingPayee>>(getModelToken(existingPayee.name));
    recurringPaymentModel = module.get<Model<RecurringPayment>>(getModelToken(RecurringPayment.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('transferMoney', () => {
    it('should transfer money between accounts successfully', async () => {
      const transferDto: TransferDto = {
        fromAccount: '1234567',
        toAccount: '7654321',
        amount: 100,
      };

      const senderAccount = {
        accountNumber: '1234567',
        balance: 200,
        save: jest.fn().mockResolvedValue(true),
        username: 'senderUser',
      };

      const recipientAccount = {
        accountNumber: '7654321',
        balance: 50,
        save: jest.fn().mockResolvedValue(true),
      };

      // Mocking findOne to return sender and recipient accounts directly
      (userAccountModel.findOne as jest.Mock).mockImplementation((query) => {
        if (query.accountNumber === '1234567') {
          return Promise.resolve(senderAccount);
        } else if (query.accountNumber === '7654321') {
          return Promise.resolve(recipientAccount);
        }
        return Promise.resolve(null);
      });

      const createTransactionSpy = jest.fn().mockResolvedValue(true);
      (transactionHistoryModel.create as jest.Mock).mockImplementation(createTransactionSpy);

      const result = await service.transferMoney(transferDto);

      expect(senderAccount.balance).toBe(100);
      expect(recipientAccount.balance).toBe(150);
      expect(senderAccount.save).toHaveBeenCalled();
      expect(recipientAccount.save).toHaveBeenCalled();
      expect(createTransactionSpy).toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'Transfer successful' });
    });

    it('should return an error if sender account is not found', async () => {
      const transferDto: TransferDto = {
        fromAccount: '0000000',
        toAccount: '7654321',
        amount: 100,
      };

      (userAccountModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.transferMoney(transferDto);

      expect(result).toEqual({ success: false, message: 'Sender account not found' });
    });

    it('should return an error if recipient account is not found', async () => {
      const transferDto: TransferDto = {
        fromAccount: '1234567',
        toAccount: '9999999',
        amount: 100,
      };

      const senderAccount = {
        accountNumber: '1234567',
        balance: 200,
        save: jest.fn().mockResolvedValue(true),
        username: 'senderUser',
      };

      (userAccountModel.findOne as jest.Mock).mockImplementation((query) => {
        if (query.accountNumber === '1234567') {
          return Promise.resolve(senderAccount);
        }
        return Promise.resolve(null);
      });

      const result = await service.transferMoney(transferDto);

      expect(result).toEqual({ success: false, message: 'Recipient account not found' });
    });

    it('should return an error if sender has insufficient funds', async () => {
      const transferDto: TransferDto = {
        fromAccount: '1234567',
        toAccount: '7654321',
        amount: 300,
      };

      const senderAccount = {
        accountNumber: '1234567',
        balance: 200,
        save: jest.fn().mockResolvedValue(true),
        username: 'senderUser',
      };

      const recipientAccount = {
        accountNumber: '7654321',
        balance: 50,
        save: jest.fn().mockResolvedValue(true),
      };

      (userAccountModel.findOne as jest.Mock).mockImplementation((query) => {
        if (query.accountNumber === '1234567') {
          return Promise.resolve(senderAccount);
        } else if (query.accountNumber === '7654321') {
          return Promise.resolve(recipientAccount);
        }
        return Promise.resolve(null);
      });

      const result = await service.transferMoney(transferDto);

      expect(result).toEqual({ success: false, message: 'Insufficient funds' });
    });
  });

  describe('bpayPayment', () => {
    it('should process BPAY payment successfully', async () => {
      const username = 'testUser';
      const fromAccNumber = '1234567';
      const billerCode = '12345';
      const companyName = 'Utility Company';
      const referenceNumber = 'ABC123';
      const amount = 100;

      const senderAccount = {
        accountNumber: fromAccNumber,
        balance: 200,
        save: jest.fn().mockResolvedValue(true),
        username: 'testUser',
      };

      (userAccountModel.findOne as jest.Mock).mockResolvedValue(senderAccount);

      const createBpayTransactionSpy = jest.fn().mockResolvedValue(true);
      (BPAYHistoryModel.create as jest.Mock).mockImplementation(createBpayTransactionSpy);

      const result = await service.bpayPayment(
        username,
        fromAccNumber,
        billerCode,
        companyName,
        referenceNumber,
        amount,
      );

      expect(senderAccount.balance).toBe(100);
      expect(senderAccount.save).toHaveBeenCalled();
      expect(createBpayTransactionSpy).toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'BPAY payment successful' });
    });

    it('should return an error if sender has insufficient funds', async () => {
      const username = 'testUser';
      const fromAccNumber = '1234567';
      const billerCode = '12345';
      const companyName = 'Utility Company';
      const referenceNumber = 'ABC123';
      const amount = 300;

      const senderAccount = {
        accountNumber: fromAccNumber,
        balance: 200,
        save: jest.fn().mockResolvedValue(true),
        username: 'testUser',
      };

      (userAccountModel.findOne as jest.Mock).mockResolvedValue(senderAccount);

      const result = await service.bpayPayment(
        username,
        fromAccNumber,
        billerCode,
        companyName,
        referenceNumber,
        amount,
      );

      expect(result).toEqual({ success: false, message: 'Insufficient funds' });
    });

    it('should return an error if sender account is not found', async () => {
      const username = 'testUser';
      const fromAccNumber = '0000000';
      const billerCode = '12345';
      const companyName = 'Utility Company';
      const referenceNumber = 'ABC123';
      const amount = 100;

      (userAccountModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.bpayPayment(
        username,
        fromAccNumber,
        billerCode,
        companyName,
        referenceNumber,
        amount,
      );

      expect(result).toEqual({ success: false, message: 'Account not found' });
    });
  });

  describe('getUserTransactions', () => {
    it('should return an empty array if no transactions are found', async () => {
      const username = 'testUser';

      (transactionHistoryModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getUserTransactions(username);

      expect(result).toEqual([]);
      expect(transactionHistoryModel.find).toHaveBeenCalledWith({ username });
    });

    it('should retrieve all transactions for the user', async () => {
      const username = 'testUser';

      const transactions = [
        {
          username: 'testUser',
          fromAccNumber: '1234567',
          toAccNumber: '7654321',
          amount: 100,
          date: new Date('2021-01-01T10:00:00Z'),
          time: '10:00:00 AM',
        },
      ];

      (transactionHistoryModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(transactions),
      });

      const result = await service.getUserTransactions(username);

      expect(result).toHaveLength(1);
      expect(result).toEqual(transactions);
      expect(transactionHistoryModel.find).toHaveBeenCalledWith({ username });
    });
  });

  describe('deposit', () => {
    it('should deposit the correct amount into the user\'s account', async () => {
      const username = 'testUser';
      const accountNumber = '1234567';
      const depositAmount = 100;

      const userAccount = {
        accountNumber: '1234567',
        balance: 200,
        save: jest.fn().mockResolvedValue(true),
      };

      (userAccountModel.findOne as jest.Mock).mockResolvedValue(userAccount);

      const result = await service.deposit(username, accountNumber, depositAmount);

      expect(userAccount.balance).toBe(300); // 200 + 100 deposit
      expect(userAccount.save).toHaveBeenCalled();
      expect(result).toEqual([true, 'Deposit successful']);
    });

    it('should return an error if the user account is not found', async () => {
      const username = 'testUser';
      const accountNumber = '0000000';
      const depositAmount = 100;

      (userAccountModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.deposit(username, accountNumber, depositAmount);

      expect(result).toEqual([false, 'User account not found']);
    });
  });

});
