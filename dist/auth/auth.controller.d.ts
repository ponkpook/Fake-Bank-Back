import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(): string;
    validate(username: string, password: string): Promise<string>;
    register(username: string, password: string, confirmPassword: string): Promise<string>;
}
