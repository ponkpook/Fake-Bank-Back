import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(): string;
    validate(username: string, password: string): Promise<{
        success: boolean;
    }>;
    register(username: string, password: string): Promise<{
        msg: String;
        success: Boolean;
    }>;
}
