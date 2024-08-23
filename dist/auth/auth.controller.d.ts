import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(): string;
    validate(username: string, password: string): string;
    register(username: string, password: string, confirmPassword: string): string;
    getUsers(): string;
}
