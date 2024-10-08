import { Injectable } from '@nestjs/common';
import { UserService } from '../User/user.service';

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
            
        var isAdmin = false;

        if (username == "admin1" || username == "admin2" || username == "admin3") {
            isAdmin = true;
        }
        this.userService.createUser(
            {
                username: username,
                password: password,
                isAdmin: isAdmin,
                date: new Date()
            }
        );
        this.userService.createDefaultAcc(username);

        return { msg: 'User created', success: true };
    }
}
