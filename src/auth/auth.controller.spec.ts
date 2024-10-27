import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { validate } from 'class-validator';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            validate: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should call AuthService.register with correct parameters', async () => {
      const registerSpy = jest.spyOn(authService, 'register').mockResolvedValue({ message: 'User created', success: true });
      const result = await authController.register('testuser','testpass');
      expect(registerSpy).toHaveBeenCalledWith('testuser', 'testpass');
      expect(result).toEqual({ message: 'User created', success: true });
    });
  });
    
  describe('login', () => {
    it('should call AuthService.validate with correct parameters', async () => {
      const validateSpy = jest.spyOn(authService, 'validate').mockResolvedValue({success: true, message: 'Login successful'});
      const result = await authController.validate('testuser', 'testpass');
      expect(validateSpy).toHaveBeenCalledWith('testuser', 'testpass');
      expect(result).toEqual({ success: true,  message:'Login successful'});
    });
  });
});