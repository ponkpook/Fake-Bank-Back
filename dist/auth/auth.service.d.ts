import { UserService } from '../User/user.service';
export declare class AuthService {
    private readonly userService;
    constructor(userService: UserService);
    validate(username: string, password: string): Promise<boolean>;
    register(username: string, password: string, confirmPassword: string): Promise<{
        msg: String;
        success: Boolean;
    }>;
}
