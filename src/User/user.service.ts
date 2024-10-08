import { Injectable, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose'
import { User } from '../schemas/user.schema'
import { userAccount } from "../schemas/userAccount.schema";
import { createUserDto } from "./dto/CreateUser.dto";
import { UpdateUserDto } from "./dto/UpdateUser.dto";
import { TransferDto } from './dto/Transfer.dto';
import { transactionHistory } from "../schemas/transactionHistory.schema";
import { BPAYHistory } from "../schemas/BPAY.schema";
import { existingPayee } from "../schemas/existingPayee.schema";
import { payeeDTO } from "./dto/existingPayee.dto";

@Injectable()
export class UserService{
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(userAccount.name) private userAccountModel: Model<userAccount>,
        @InjectModel(transactionHistory.name) private transactionHistoryModel: Model<userAccount>,
        @InjectModel(BPAYHistory.name) private BPAYHistory: Model<BPAYHistory>,
        @InjectModel(existingPayee.name) private existingPayeeModel: Model<existingPayee>
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

    async addNewAccount(username: string, accountName: string, balance: number):
        Promise<{username:String, accountName:String, accountNumber:String, BSB:String, balance:number}> {
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
        return account;
    }


// transfer to others does not require a existing bsb and account number
async transferMoneyToOthers(transferDto: TransferDto): Promise<string> {
        const { fromAccount, toAccount, amount } = transferDto;
        if (amount <= 0) {
            throw new HttpException('Transfer amount must be greater than zero', 400);
        }
        const sender = await this.userAccountModel.findOne({ accountNumber: fromAccount });
        if (!sender) {
            throw new HttpException('Sender account not found', 404);
        }
        const recipient = await this.userAccountModel.findOne({ accountNumber: toAccount });
        if (sender.balance < amount) {
            throw new HttpException('Insufficient funds', 400);
        }
        sender.balance -= amount;
        // Save both accounts
        await Promise.all([sender.save()]);
        const record = ({
            username: sender.username,
            fromAccNumber: fromAccount,
            toAccNumber: toAccount,
            amount: amount,
            date: new Date(),
            time: new Date().toLocaleTimeString()
        });
        const newRecord = new this.transactionHistoryModel(record);
        await newRecord.save();
        return 'Transfer successful';
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
            time: new Date().toLocaleTimeString()
        });
        const newRecord = new this.transactionHistoryModel(record);
        await newRecord.save();
        return 'Transfer successful';
    }

    async getUserTransactions(username: string) {
        const transactions = await this.transactionHistoryModel.find({ username }).exec();
        const BPAYtransactions = await this.BPAYHistory.find({ username }).exec();
        const allTransactions = [...transactions, ...BPAYtransactions];
        return allTransactions;
    }

    async deposit(username: string, accountNumber: string, amount: number) {
        const account = await this.getUserAccount(username, accountNumber);
        account.balance = Number(account.balance)+Number(amount);
        await account.save();
        return;
    }


    async bpayPayment(username: String,fromAccNumber:String, billerCode:String, companyName:String, referenceNumber:String, amount:number): Promise<string> {
        if (amount <= 0) {
            throw new HttpException('Payment amount must be greater than zero', 400);
        }
    
        // Fetch the user's account
        const sender = await this.userAccountModel.findOne({ accountNumber: fromAccNumber });
        if (!sender) {
            throw new HttpException('Sender account not found', 404);
        }
    
    
        // Check if the sender has sufficient funds
        if (sender.balance < amount) {
            throw new HttpException('Insufficient funds', 400);
        }
    
        // Deduct the amount from the user's account
        sender.balance -= amount;
        await sender.save();
    
        // Create a BPAY transaction record
        const newTransaction = new this.BPAYHistory({
            username,
            fromAccNumber,
            billerCode,
            companyName,
            referenceNumber,
            amount,
            date: new Date(),
            time: new Date().toLocaleTimeString()
        });
        await newTransaction.save();
    
        return `BPAY payment to ${companyName} successful`;
    }


    async checkUserExpirationStatus(username: string): Promise<string> {
        // Fetch the user by username (excluding admins if needed)
        const user = await this.userModel.findOne({ username, isAdmin: false });
    
        if (!user) {
            throw new HttpException('User not found', 404);
        }

        if (user.isAdmin){
            throw new HttpException('User is an admin', 404);
        }
    
        const currentDate = new Date();
        const userCreationDate = new Date(user.date);
    
        // Calculate the expiration date (70 days after the creation date)
        const expirationDate = new Date(userCreationDate);
        expirationDate.setDate(userCreationDate.getDate() + 70); // 70 days = 10 weeks
    
        // Calculate the time difference
        const timeDifference = expirationDate.getTime() - currentDate.getTime();
        const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert to days
    
        // If the user is expired
        if (daysLeft <= 0) {
            return `User ${user.username} is expired.`;
        }
    
        // If the user still has time left
        return `User ${user.username} is active with ${daysLeft} days left until expiration.`;
    }
    

    async removeExpiredUsers() {
        const expiredUsers = await this.userModel.deleteMany({
            isAdmin: false,
            date: { $lt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000) } // 70 days ago
        });
        
        console.log(`Removed ${expiredUsers.deletedCount} expired users.`);
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
    
    deleteUser(username: string) {
        this.userModel.deleteMany({ username }).exec();
        this.userAccountModel.deleteMany({ username }).exec();
        this.BPAYHistory.deleteMany({ username }).exec();
        this.transactionHistoryModel.deleteMany({ username }).exec();
        return;
    }
    
    getUserAccounts(username: string){
        return this.userAccountModel.find({username}).exec();
    }
    getUserAccount(username: string, accountNumber: string) {
        return this.userAccountModel.findOne({ username, accountNumber }).exec();
    }

    async getPayees(username: string): Promise<payeeDTO[]> {
        const accounts = await this.existingPayeeModel.find({ username }).exec();
        return accounts;
    }

    async addPayee(payeeDto: payeeDTO): Promise<{ success: boolean, message:string }> {
        if (this.userAccountModel.findOne({ accountNumber: payeeDto.accountNumber, BSB: payeeDto.BSB }) == null) {
            return { success: false, message: 'Account number or BSB does not exist' };
        } else {
            const newPayee = new this.existingPayeeModel(payeeDto);
            await newPayee.save();
            return { success: true, message: 'Payee added successfully' };
        }
    }
}
