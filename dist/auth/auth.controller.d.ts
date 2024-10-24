import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(): string;
    validate(username: string, password: string): Promise<{
        success: boolean;
        message: string;
    }>;
    register(username: string, password: string): Promise<{
        success: Boolean;
        message: string;
    }>;
}
