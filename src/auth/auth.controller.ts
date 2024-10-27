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
    async validate(@Body('username') username: string, @Body('password') password: string): Promise<{ success: boolean, message: string }> {
        return this.authService.validate(username, password);
    }
    
    @Post('register')
    async register(@Body('username') username: string, @Body('password') password: string){
        return this.authService.register(username, password);
    }   
}
