import { Injectable } from '@nestjs/common';
import { UserService } from 'src/User/user.service';

@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService) {}

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

    public async register(username: string, password: string, confirmPassword: string): Promise<{msg:String, success:Boolean}> {
        if (username == "" || password == "" || confirmPassword == ""
            || username == null || password == null || confirmPassword == null
        ){
            return {msg:'Please fill out all fields', success:false};
        }

        if (password !== confirmPassword) {
            return {msg:'Passwords do not match', success:false};   
        }

        const user = await this.userService.getUser(username);
        if (user != null) {
            return {msg: 'Username already exists', success:false};
        }
            
        this.userService.createUser(
            {
                username: username,
                password: password
            }
        );
        this.userService.createDefaultAcc(username);

        return { msg: 'User created', success: true };
    }
}
