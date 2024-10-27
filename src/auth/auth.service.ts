import { Injectable } from '@nestjs/common';
import { UserService } from '../User/user.service';

@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService) {}

    public async validate(username: string, password: string): Promise<{success: boolean, message: string}> {
        const user = await this.userService.getUser(username); 
        if (user == null) {
            return {success: false, message: 'User not found'};
        }
        if (user.password === password) {
            return {success: true, message: 'Login successful'};
        } else {
            return {success: false, message: 'Incorrect password'};
        }
    }

    public async register(username: string, password: string): Promise<{success:Boolean, message: string}> {
        if (username == "" || password == ""
            || username == null || password == null
        ){
            return {message:'Please fill out all fields', success:false};
        }
        const user = await this.userService.getUser(username);
        if (user != null) {
            return {message: 'Username already exists', success:false};
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
        return {message: 'User created', success: true };
    }
}
