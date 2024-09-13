import { Injectable } from '@nestjs/common';
import { UserService } from 'src/User/user.service';

@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService) {}

    private bsbPool = [
        '000-001',
        '000-002',
        '000-003',
        '000-004',
        '000-005',
        '111-001',
        '111-002',
        '111-003',
        '112-001',
        '112-002'
    ]

    public async validate(username: string, password: string): Promise<boolean> {
        const user = await this.userService.getUser(username); 
        if (user == null) {
            return false;
        }
        if (user.password === password) {
            return true;
        }
        return false;
    }

    public async register(username: string, password: string, confirmPassword: string): Promise<string> {
        
        if (username == "" || password == "" || confirmPassword == ""
            || username == null || password == null || confirmPassword == null
        ){
            return 'Please fill out all fields';
        }

        if (password !== confirmPassword) {
            return 'Passwords do not match';
        }

        const user = await this.userService.getUser(username);
        if (user != null) {
            return 'Username already exists';
        }
            
        this.userService.createUser(
            {
                username: username,
                password: password
            }
        );
        this.userService.createDefaultAcc(username);

        return 'User created';
    }
}
