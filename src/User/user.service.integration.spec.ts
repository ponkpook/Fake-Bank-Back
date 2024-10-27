// user.service.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserSchema } from '../schemas/user.schema';
import { userAccount, userAccountSchema } from '../schemas/userAccount.schema';
import { transactionHistory, transactionHistorySchema } from '../schemas/transactionHistory.schema';
import { existingPayee, existingPayeeSchema } from '../schemas/existingPayee.schema';
import { RecurringPayment, RecurringPaymentSchema } from '../schemas/recurringPayments.schema';
import { BPAYHistory, BPAYSchema } from '../schemas/BPAY.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, Model } from 'mongoose';
import { TransferDto } from './dto/Transfer.dto';

describe('UserService Integration Tests', () => {
  let service: UserService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let userAccountModel: Model<userAccount>;
  let transactionHistoryModel: Model<transactionHistory>;
  let BPAYHistoryModel: Model<BPAYHistory>;
  let existingPayeeModel: Model<existingPayee>;
  let recurringPaymentModel: Model<RecurringPayment>;
  let connection: Connection;


  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    

    // Set up the testing module
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: userAccount.name, schema: userAccountSchema },
          { name: transactionHistory.name, schema: transactionHistorySchema },
          { name: BPAYHistory.name, schema: BPAYSchema },
          { name: existingPayee.name, schema: existingPayeeSchema },
          { name: RecurringPayment.name, schema: RecurringPaymentSchema },
        ]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    userAccountModel = module.get<Model<userAccount>>(getModelToken(userAccount.name));
    transactionHistoryModel = module.get<Model<transactionHistory>>(getModelToken(transactionHistory.name));
    BPAYHistoryModel = module.get<Model<BPAYHistory>>(getModelToken(BPAYHistory.name));
    existingPayeeModel = module.get<Model<existingPayee>>(getModelToken(existingPayee.name));
    recurringPaymentModel = module.get<Model<RecurringPayment>>(getModelToken(RecurringPayment.name));

    connection = module.get(getConnectionToken());
  });

  afterAll(async () => {
    await connection.close();
    await mongoose.disconnect();
    await mongod.stop();
    mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the database between tests
    for (const collection of Object.values(connection.collections)) {
      await collection.deleteMany({});
    }
  });


  describe('getUserTransactions', () => {
    it('should retrieve all transactions for the user', async () => {
      // Create transaction records
      const transactions = [
        {
          username: 'testUser',
          fromAccNumber: '1234567',
          toAccNumber: '7654321',
          amount: 100,
          date: new Date(),
          time: '10:00 AM',
        },
        {
          username: 'testUser',
          fromAccNumber: '1234567',
          toAccNumber: '7654322',
          amount: 200,
          date: new Date(),
          time: '11:00 AM',
        },
      ];
      await transactionHistoryModel.insertMany(transactions);

      // Call getUserTransactions
      const result = await service.getUserTransactions('testUser');

      // Assertions
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(100);
      expect(result[1].amount).toBe(200);
    });
  });


  describe('deposit', () => {
    it('should deposit the correct amount into the user\'s account', async () => {
      // Create a user account
      const account = await userAccountModel.create({
        username: 'testUser',
        accountName: 'Everyday',
        accountNumber: '1234567',
        BSB: '000-001',
        balance: 200,
      });

      // Call the deposit method
      const result = await service.deposit('testUser', '1234567', 100);

      // Fetch the updated account
      const updatedAccount = await userAccountModel.findOne({ accountNumber: '1234567' });

      // Assertions
      expect(updatedAccount.balance).toBe(300); // 200 + 100
      expect(result).toEqual([true, 'Deposit successful']);
    });

    it('should return an error if the account is not found', async () => {
      const result = await service.deposit('testUser', '9999999', 100);

      expect(result).toEqual([false, 'User account not found']);
    });
  });

  describe('transferMoney', () => {
    it('should transfer money between accounts successfully', async () => {
    
      
      const senderAccount = {
        accountNumber: '1111111',
        balance: 500,
        username: 'senderUser',
        accountName: 'Everyday',
        BSB: '000-001',
      };
  
      const recipientAccount = {
        accountNumber: '7777777',
        balance: 200,
        username: 'recipientUser',
        accountName: 'Savings',
        BSB: '000-002',
      };

      const transferDto: TransferDto = {
        fromAccount: '1111111',
        toAccount: '7777777',
        amount: 150,
      };

      await userAccountModel.create(senderAccount);
      await userAccountModel.create(recipientAccount);

      // Call the transferMoney function
      const result = await service.transferMoney(transferDto);

      // Fetch updated accounts from the database
      const updatedSender = await userAccountModel.findOne({ accountNumber: '1111111' });
      const updatedRecipient = await userAccountModel.findOne({ accountNumber: '7777777' });

      // Assertions
      expect(updatedSender.balance).toBe(350); // 500 - 150
      expect(updatedRecipient.balance).toBe(350); // 200 + 150
      expect(result).toEqual({ success: true, message: 'Transfer successful' });
    });

    it('should return an error if sender has insufficient funds', async () => {
      // Create sender and recipient accounts
      const senderAccount = await userAccountModel.create({
        username: 'senderUser5',
        accountName: 'Everyday',
        accountNumber: '4444444',
        BSB: '100-001',
        balance: 100, // Insufficient funds
      });

      const recipientAccount = await userAccountModel.create({
        username: 'recipientUser5',
        accountName: 'Savings',
        accountNumber: '3333333',
        BSB: '200-002',
        balance: 200,
      });

      await userAccountModel.create(senderAccount);
      await userAccountModel.create(recipientAccount);

      const transferDto: TransferDto = {
        fromAccount: '4444444',
        toAccount: '3333333',
        amount: 150, // More than sender's balance
      };


      // Call the transferMoney method
      const result = await service.transferMoney(transferDto);

      // Assertions
      expect(result).toEqual({ success: false, message: 'Insufficient funds' });

      // Verify that balances have not changed
      const updatedSender = await userAccountModel.findOne({ accountNumber: '4444444' });
      const updatedRecipient = await userAccountModel.findOne({ accountNumber: '3333333' });

      expect(updatedSender.balance).toBe(100);
      expect(updatedRecipient.balance).toBe(200);
    });

    it('should return an error if recipient account is not found', async () => {
      // Create sender account
      const senderAccount = await userAccountModel.create({
        username: 'senderUser',
        accountName: 'Everyday',
        accountNumber: '1234567',
        BSB: '000-001',
        balance: 500,
      });

      const transferDto: TransferDto = {
        fromAccount: '1234567',
        toAccount: '9999999', // Non-existent recipient
        amount: 150,
      };

      // Call the transferMoney method
      const result = await service.transferMoney(transferDto);

      // Assertions
      expect(result).toEqual({ success: false, message: 'Recipient account not found' });
    });
  });

  describe('bpayPayment', () => {
    it('should process BPAY payment successfully', async () => {
      const username = 'testUser';
      const fromAccNumber = '6666666';
      const billerCode = '12345';
      const companyName = 'Utility Company';
      const referenceNumber = 'ABC123';
      const amount = 200; // Ensure the payment amount matches the expected deduction

      // Create sender account in the database
      const senderAccount = await userAccountModel.create({
        accountNumber: fromAccNumber,
        balance: 500, // Ensure the initial balance is 500
        username: 'testUser1',
        accountName: 'Everyday',
        BSB: '000-001',
      });

      // Call the BPAY payment method
      const result = await service.bpayPayment(
        username,
        fromAccNumber,
        billerCode,
        companyName,
        referenceNumber,
        amount,
      );

      // Fetch the updated sender account from the database
      const updatedSender = await userAccountModel.findOne({ accountNumber: fromAccNumber });

      // Assertions
      expect(updatedSender.balance).toBe(300); // 500 - 200 = 300
      expect(result).toEqual({ success: true, message: 'BPAY payment successful' });

      // Verify BPAYHistory record
      const bpayRecord = await BPAYHistoryModel.findOne({ referenceNumber: referenceNumber });
      expect(bpayRecord).toBeDefined();
      expect(bpayRecord.amount).toBe(amount);
    });

    it('should return an error if insufficient funds', async () => {
      // Create sender account
      const senderAccount = await userAccountModel.create({
        username: 'testUser2',
        accountName: 'Everyday',
        accountNumber: '5555555',
        BSB: '000-001',
        balance: 100,
      });

      // Call bpayPayment method
      const result = await service.bpayPayment(
        'testUser2',
        '5555555',
        '12345',
        'Utility Company',
        'REF123',
        200,
      );

      // Assertions
      expect(result).toEqual({ success: false, message: 'Insufficient funds' });
    });

    it('should return an error if account not found', async () => {
      // Call bpayPayment method with non-existent account
      const result = await service.bpayPayment(
        'testUser',
        '9999999', // Non-existent account number
        '12345',
        'Utility Company',
        'REF123',
        200,
      );

      // Assertions
      expect(result).toEqual({ success: false, message: 'Account not found' });
    });
  });
});
