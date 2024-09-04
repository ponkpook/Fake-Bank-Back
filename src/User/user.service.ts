import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose'
import { User } from 'src/schemas/user.schema'
import { userAccount } from "src/schemas/userAccount.schema";
import { createUserDto } from "./dto/CreateUser.dto";
import { UpdateUserDto } from "./dto/UpdateUser.dto";


@Injectable()
export class UserService{
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(userAccount.name) private userAccountModel: Model<userAccount>
    ) { }

    private bsbPool = [
        "000-001",
        "000-002",
        "000-003",
        "000-004",
        "000-005",
        "111-001",
        "111-002",
        "111-003",
        "112-001",
        "112-002"
    ];
    
    
    createUser(createUserDto:createUserDto){
        const newUser = new this.userModel(createUserDto);
        return newUser.save();
    }

    async createDefaultAcc(username: string){
        const defaultAcc1 = {
            username: username,
            accountName: "Default Account 1",
            accountNumber: Math.floor(Math.random() * 1000000).toString(),
            BSB: this.bsbPool[Math.floor(Math.random() * this.bsbPool.length)],
            balance: 10000,
        }
        const defaultAcc2 = {
            username: username,
            accountName: "Default Account 2",
            accountNumber: Math.floor(Math.random() * 10000000).toString().padStart(7, '0'),
            BSB: this.bsbPool[Math.floor(Math.random() * this.bsbPool.length)],
            balance: 10000,
        }
        const newAcc1 = new this.userAccountModel(defaultAcc1);
        const newAcc2 = new this.userAccountModel(defaultAcc2);
        await Promise.all([newAcc1.save(), newAcc2.save()]);
        return;
    }

    getUsers(){
        return this.userModel.find();
    }
    getUser(username: string){
        return this.userModel.findOne({username}).exec();
    }
    updateUser(id: string, UpdateUserDto: UpdateUserDto){
        return this.userModel.findByIdAndUpdate(id, UpdateUserDto);
    }
    deleteUser(id: string){
        return this.userModel.findByIdAndDelete(id);
    }


}