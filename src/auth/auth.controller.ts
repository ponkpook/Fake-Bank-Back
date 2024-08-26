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
    validate(@Query('username') username: string, @Query('password') password: string): string {
        if (this.authService.validate(username, password)) {
            return 'login success!';
        } else {
            return "invalid username or password!";
        }
    }

    @Post('register')
    register(@Query('username') username:string, @Query('password') password: string, @Query('confirmPassword') confirmPassword: string): string {
        if(username === undefined || password === undefined || confirmPassword === undefined || 
            username === '' || password === '' || confirmPassword === ''){
            return 'username or password cannot be empty!';
        }
        if(this.authService.isUsernameUnique(username)){
            if(password === confirmPassword){
                this.authService.register(username, password);
                return 'register success!';
            } else {
                return 'passwords do not match!';
            }
        }else{
            return 'username already exists!';
        }
    }

    @Get('getUsers')
    getUsers(): string {
        return this.authService.getUsers() +'\n'+ this.authService.getBsbAcc();
    }
        
}
