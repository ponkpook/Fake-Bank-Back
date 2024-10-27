import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../User/user.service';
import { User } from '../schemas/user.schema';
import { Document, Types } from 'mongoose';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            getUser: jest.fn(),
            createUser: jest.fn(),
            createDefaultAcc: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should return "Username already exists" if user exists', async () => {
    const mockUser: Partial<Document<unknown, {}, User> & User & { _id: Types.ObjectId }> = {
      _id: new Types.ObjectId(),
      username: 'existingUser',
      password: 'hashedPassword',
      isAdmin: false,
      date: new Date(),
    };

    jest.spyOn(userService, 'getUser').mockResolvedValue(mockUser as Document<unknown, {}, User> & User & { _id: Types.ObjectId });

    const result = await authService.register('existingUser', 'password');

    expect(result).toEqual({ message: 'Username already exists', success: false });
  });

  it('should create a new user if username does not exist', async () => {
    jest.spyOn(userService, 'getUser').mockResolvedValue(null);
    jest.spyOn(userService, 'createUser').mockResolvedValue(null);
    jest.spyOn(userService, 'createDefaultAcc').mockResolvedValue(null);

    const result = await authService.register('newUser', 'password');

    expect(userService.createUser).toHaveBeenCalledWith({
      username: 'newUser',
      password: 'password',
      isAdmin: false,
      date: expect.any(Date),
    });
    expect(userService.createDefaultAcc).toHaveBeenCalledWith('newUser');
    expect(result).toEqual({ message: 'User created', success: true });
  });

  it('should set isAdmin to true for admin users', async () => {
    jest.spyOn(userService, 'getUser').mockResolvedValue(null);
    jest.spyOn(userService, 'createUser').mockResolvedValue(null);
    jest.spyOn(userService, 'createDefaultAcc').mockResolvedValue(null);

    const result = await authService.register('admin1', 'password');

    expect(userService.createUser).toHaveBeenCalledWith({
      username: 'admin1',
      password: 'password',
      isAdmin: true,
      date: expect.any(Date),
    });
    expect(userService.createDefaultAcc).toHaveBeenCalledWith('admin1');
    expect(result).toEqual({ message: 'User created', success: true });
  });
});