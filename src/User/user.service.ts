import { Injectable, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose'
import { User } from 'src/schemas/user.schema'
import { userAccount } from "src/schemas/userAccount.schema";
import { createUserDto } from "./dto/CreateUser.dto";
import { UpdateUserDto } from "./dto/UpdateUser.dto";
import { TransferDto } from './dto/Transfer.dto';
import { transactionHistory } from "src/schemas/transactionHistory.schema";


@Injectable()
export class UserService{
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(userAccount.name) private userAccountModel: Model<userAccount>,
        @InjectModel(transactionHistory.name) private transactionHistoryModel: Model<userAccount>
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
        this.addNewAccount(username,"Everyday", 100.00);
        this.addNewAccount(username,"Savings", 1000.00);
        return;
    }

    async isUniqueAccNum(accNum: string): Promise<boolean> {
        const notUnique = await this.userAccountModel.findOne({ accountNumber: accNum }).exec();
        return !notUnique;
    }

    async addNewAccount(username: string, accountName: string, balance: number): Promise<void> {
        let account;
        do {
            account = {
                username: username,
                accountName: accountName,
                accountNumber: Math.floor(Math.random() * 10000000).toString().padStart(7, '0'),
                BSB: this.bsbPool[Math.floor(Math.random() * this.bsbPool.length)],
                balance: balance,
            }
        } while (!(await this.isUniqueAccNum(account.accountNumber)));
        const newAcc1 = new this.userAccountModel(account);
        await newAcc1.save();
        return;
    }


    async transferMoney(transferDto: TransferDto): Promise<string> {
        
        const { fromAccount, toAccount, amount } = transferDto;

        if (amount <= 0) {
            throw new HttpException('Transfer amount must be greater than zero', 400);
        }

        const sender = await this.userAccountModel.findOne({ accountNumber: fromAccount });
        if (!sender) {
            throw new HttpException('Sender account not found', 404);
        }

        const recipient = await this.userAccountModel.findOne({ accountNumber: toAccount });
        if (!recipient) {
            throw new HttpException('Recipient account not found', 404);
        }

        if (sender.balance < amount) {
            throw new HttpException('Insufficient funds', 400);
        }

        sender.balance -= amount;
        recipient.balance += amount;

        // Save both accounts
        await Promise.all([sender.save(), recipient.save()]);

        const record = ({
            username: sender.username,
            fromAccNumber: fromAccount,
            toAccNumber: toAccount,
            amount: amount,
            date: new Date(),
        });

        
        return 'Transfer successful';
    }

    async getUserTransactions(username: string) {
        const transactions = await this.transactionHistoryModel.find({ username }).exec();
        return transactions;
    }

    getUsers(){
        return this.userModel.find();
    }
    getUser(username: string) {
        return this.userModel.findOne({username}).exec();
    }
    updateUser(id: string, UpdateUserDto: UpdateUserDto){
        return this.userModel.findByIdAndUpdate(id, UpdateUserDto);
    }
    deleteUser(id: string){
        return this.userModel.findByIdAndDelete(id);
    }
    getUserAccounts(username: string){
        return this.userAccountModel.find({username}).exec();
    }

}