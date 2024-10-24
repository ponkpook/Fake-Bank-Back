import { UserService } from '../User/user.service';
export declare class AuthService {
    private readonly userService;
    constructor(userService: UserService);
    validate(username: string, password: string): Promise<{
        success: boolean;
        message: string;
    }>;
    register(username: string, password: string): Promise<{
        success: Boolean;
        message: string;
    }>;
}
