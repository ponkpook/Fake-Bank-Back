import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('login')
    login(): string {
        return 'login!';
    }

    @Post('login')
    async validate(@Query('username') username: string, @Query('password') password: string): Promise<string> {
        const isValid = await this.authService.validate(username, password);
        if (isValid) {
            return 'login success!';
        } else {
            return "invalid username or password!";
        }
    }

    @Post('register')
    register(@Query('username') username:string, @Query('password') password: string, @Query('confirmPassword') confirmPassword: string): Promise<string> {
        return this.authService.register(username, password, confirmPassword);
    }
        
}
