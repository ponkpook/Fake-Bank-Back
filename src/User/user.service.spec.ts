// user.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException } from '@nestjs/common';
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
        // Mock UserModel
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
        // Mock userAccountModel
        {
          provide: getModelToken(userAccount.name),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),      // Mock the `save` method here (though it will be added to the result of `findOne`)
            find: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]), // Properly mock `exec()` method
              }),
          },
        },
        // Mock transactionHistoryModel
        {
          provide: getModelToken(transactionHistory.name),
          useValue: {
            create: jest.fn(), // Mock the create method correctly
            find: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]), // Properly mock `exec()` method
              }),
          },
        },
        // Mock BPAYHistoryModel
        {
          provide: getModelToken(BPAYHistory.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]), // Properly mock `exec()` method
              }),
          },
        },
        // Mock existingPayeeModel
        {
          provide: getModelToken(existingPayee.name),
          useValue: {},
        },
        {
          provide: getModelToken(RecurringPayment.name), 
          useValue: {
            create: jest.fn(),
            find: jest.fn(), // Add this to mock the `find` method
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

      // Mock transactionHistoryModel.create to simulate saving a transaction
      const createTransactionSpy = jest.fn().mockResolvedValue(true);
      (transactionHistoryModel.create as jest.Mock).mockImplementation(createTransactionSpy);

      const result = await service.transferMoney(transferDto);

      expect(senderAccount.balance).toBe(100);
      expect(recipientAccount.balance).toBe(150);
      expect(senderAccount.save).toHaveBeenCalled();
      expect(recipientAccount.save).toHaveBeenCalled();
      expect(createTransactionSpy).toHaveBeenCalled();
      expect(result).toBe('Transfer successful');
    });

    // Include other test cases as needed
  });

  describe('transferMoneyToOthers', () => {
    it('should transfer money to external accounts successfully', async () => {
      const transferDto: TransferDto = {
        fromAccount: '1234567',
        toAccount: '9999999', // External account
        amount: 100,
      };

      const senderAccount = {
        accountNumber: '1234567',
        balance: 200,
        save: jest.fn().mockResolvedValue(true),
        username: 'senderUser',
      };

      // Mocking findOne to return only the sender account
      (userAccountModel.findOne as jest.Mock).mockImplementation((query) => {
        if (query.accountNumber === '1234567') {
          return Promise.resolve(senderAccount);
        }
        return Promise.resolve(null); // Recipient account does not exist internally
      });

      // Mock transactionHistoryModel.create to simulate saving a transaction
      const createTransactionSpy = jest.fn().mockResolvedValue(true);
      (transactionHistoryModel.create as jest.Mock).mockImplementation(createTransactionSpy);

      const result = await service.transferMoneyToOthers(transferDto);

      expect(senderAccount.balance).toBe(100); // 100 deducted from sender
      expect(senderAccount.save).toHaveBeenCalled(); // Ensure sender account was saved
      expect(createTransactionSpy).toHaveBeenCalled(); // Ensure transaction history was created
      expect(result).toBe('Transfer successful');
    });

    it('should throw an error if sender has insufficient funds', async () => {
      const transferDto: TransferDto = {
        fromAccount: '1234567',
        toAccount: '9999999', // External account
        amount: 300, // More than the sender's balance
      };

      const senderAccount = {
        accountNumber: '1234567',
        balance: 200, // Less than transfer amount
        save: jest.fn().mockResolvedValue(true),
        username: 'senderUser',
      };

      // Mocking findOne to return only the sender account
      (userAccountModel.findOne as jest.Mock).mockImplementation((query) => {
        if (query.accountNumber === '1234567') {
          return Promise.resolve(senderAccount);
        }
        return Promise.resolve(null); // Recipient account does not exist internally
      });

      await expect(service.transferMoneyToOthers(transferDto)).rejects.toThrow('Insufficient funds');
    });

    it('should throw an error if sender account is not found', async () => {
      const transferDto: TransferDto = {
        fromAccount: '0000000', // Invalid sender account
        toAccount: '9999999', // External account
        amount: 100,
      };

      // Mocking findOne to return null for the sender account
      (userAccountModel.findOne as jest.Mock).mockImplementation(() => Promise.resolve(null));

      await expect(service.transferMoneyToOthers(transferDto)).rejects.toThrow('Sender account not found');
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
  
      // Mocking findOne to return sender account
      (userAccountModel.findOne as jest.Mock).mockImplementation((query) => {
        if (query.accountNumber === fromAccNumber) {
          return Promise.resolve(senderAccount);
        }
        return Promise.resolve(null);
      });
  
      // Mocking BPAYHistoryModel.create to simulate saving BPAY transaction
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
  
      expect(senderAccount.balance).toBe(100); // 100 deducted from sender
      expect(senderAccount.save).toHaveBeenCalled(); // Ensure sender account was saved
      expect(createBpayTransactionSpy).toHaveBeenCalledWith({
        username,
        fromAccNumber,
        billerCode,
        companyName,
        referenceNumber,
        amount,
        date: expect.any(Date),
        time: expect.any(String),
      }); // Ensure BPAY transaction was recorded
      expect(result).toBe(`BPAY payment to ${companyName} successful`);
    });
  
    it('should throw an error if sender has insufficient funds', async () => {
      const username = 'testUser';
      const fromAccNumber = '1234567';
      const billerCode = '12345';
      const companyName = 'Utility Company';
      const referenceNumber = 'ABC123';
      const amount = 300;
  
      const senderAccount = {
        accountNumber: fromAccNumber,
        balance: 200, // Less than payment amount
        save: jest.fn().mockResolvedValue(true),
        username: 'testUser',
      };
  
      // Mocking findOne to return sender account
      (userAccountModel.findOne as jest.Mock).mockImplementation((query) => {
        if (query.accountNumber === fromAccNumber) {
          return Promise.resolve(senderAccount);
        }
        return Promise.resolve(null);
      });
  
      await expect(
        service.bpayPayment(username, fromAccNumber, billerCode, companyName, referenceNumber, amount),
      ).rejects.toThrow('Insufficient funds');
    });
  
    it('should throw an error if sender account is not found', async () => {
      const username = 'testUser';
      const fromAccNumber = '0000000'; // Invalid account
      const billerCode = '12345';
      const companyName = 'Utility Company';
      const referenceNumber = 'ABC123';
      const amount = 100;
  
      // Mocking findOne to return null for the sender account
      (userAccountModel.findOne as jest.Mock).mockImplementation(() => Promise.resolve(null));
  
      await expect(
        service.bpayPayment(username, fromAccNumber, billerCode, companyName, referenceNumber, amount),
      ).rejects.toThrow('Sender account not found');
    });
  });
  

  describe('getUserTransactions', () => {
    it('should return an empty array if no transactions are found', async () => {
      const username = 'testUser';
  
      // Mock `find()` and `exec()` to return an empty array
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
        {
          username: 'testUser',
          fromAccNumber: '1234567',
          toAccNumber: '7654322',
          amount: 150,
          date: new Date('2021-01-02T12:00:00Z'),
          time: '12:00:00 PM',
        },
      ];
  
      // Mock `find()` and `exec()` to return transactions
      (transactionHistoryModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(transactions),
      });
  
      const result = await service.getUserTransactions(username);
  
      expect(result).toHaveLength(2);
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
        save: jest.fn().mockResolvedValue(true),  // Mock save function to simulate Mongoose behavior
      };
  
      // Mock userAccountModel.findOne to return the user account
      (userAccountModel.findOne as jest.Mock).mockResolvedValue(userAccount);
  
      // Call the deposit function
      await service.deposit(username, accountNumber, depositAmount);
  
      // Ensure that the deposit is correctly added to the balance
      expect(userAccount.balance).toBe(300); // 200 + 100 deposit
      expect(userAccount.save).toHaveBeenCalled(); // Ensure the account was saved with the new balance
    });
  });  

});
