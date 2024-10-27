// user.service.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { userAccount, userAccountSchema } from '../schemas/userAccount.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, Model } from 'mongoose';
import { AuthService } from './auth.service';
import { UserService } from '../User/user.service';

import { transactionHistory, transactionHistorySchema } from '../schemas/transactionHistory.schema';
import { existingPayee, existingPayeeSchema } from '../schemas/existingPayee.schema';
import { RecurringPayment, RecurringPaymentSchema } from '../schemas/recurringPayments.schema';
import { BPAYHistory, BPAYSchema } from '../schemas/BPAY.schema';


describe('AuthServic Integration Tests', () => {
  let service: AuthService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let userAccountModel: Model<userAccount>;
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
      providers: [AuthService, UserService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    userAccountModel = module.get<Model<userAccount>>(getModelToken(userAccount.name));
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


  describe('validate user', () => {
    it('should validate user information', async () => {
      // Create transaction records
      const user = [
          {
            username: 'testUser',
            password: 'Aa123456',
            isAdmin: false,
            date: new Date()
          }
      ];
      await userModel.insertMany(user);

      // Call getUserTransactions
      const result1 = await service.validate('testUser', 'Aa123456');
      const result2 = await service.validate('testUser', 'Aa1234567');
      // Assertions
      expect(result1).toEqual({ success: true, message: 'Login successful' });
      expect(result2).toEqual({ success: false, message: 'Incorrect password' });
    });
  });

  describe('register user', () => {
    it('should register user into databse', async () => {
      const user = [
        {
          username: 'testUser',
          password: 'Aa123456',
          isAdmin: false,
          date: new Date()
        }
      ];
      await userModel.insertMany(user);
      const result1 = await service.register('testUser1', 'testPassword');
      const result2 = await service.register('testUser', 'Aa123456');
      const result3 = await service.register(null, '');
      const result4 = await service.register('admin1', 'Aa123456');
      expect(result1).toEqual({ success: true, message: 'User created' });
      expect(result2).toEqual({ success: false, message: 'Username already exists' });
      expect(result3).toEqual({ success: false, message: 'Please fill out all fields' });
      const testUser1Accounts = await userAccountModel.find({ username: 'testUser1' });
      expect(testUser1Accounts.length).toBe(2); 
      const adminAccount = await userModel.findOne({ username: 'admin1' });
      expect(adminAccount.isAdmin).toBe(true);
    });
  });
});
