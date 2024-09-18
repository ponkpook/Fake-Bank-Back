import { Injectable, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose'
import { User } from 'src/schemas/user.schema'
import { userAccount } from "src/schemas/userAccount.schema";
import { Transaction } from "src/schemas/transaction.schema";
import { BPAY } from "src/schemas/BPAY.schema";
import { createUserDto } from "./dto/CreateUser.dto";
import { UpdateUserDto } from "./dto/UpdateUser.dto";
import { TransferDto } from './dto/Transfer.dto';
import { BPAYDto } from "./dto/BPAY.dto";



@Injectable()
export class UserService{
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(userAccount.name) private userAccountModel: Model<userAccount>, 
        @InjectModel(Transaction.name) private TransactionModel: Model<Transaction>,
        @InjectModel(BPAY.name) private BPAYModel: Model<BPAY>
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

            // Create a new transaction record
        const newTransaction = new this.TransactionModel({
            fromAccount,
            toAccount,
            amount,
            date: new Date(),
        });
        await newTransaction.save();

        return 'Transfer successful';
    }




    async getTransactionsForAccount(accountNumber: string): Promise<Transaction[]> {
        // Fetch the account details to ensure the account exists
        const account = await this.userAccountModel.findOne({ accountNumber });
        if (!account) {
            throw new HttpException('Account not found', 404);
        }

        // Fetch all transactions related to this account
        const transactions = await this.TransactionModel.find({
            $or: [
                { fromAccount: accountNumber },
                 { toAccount: accountNumber }
            ]
        }).sort({ date: -1 });
        return transactions;
    }



    // Register a BPAY company account
    async registerBpayAccount(billerCode: string, companyName: string, referenceNumber: string): Promise<BPAY> {
        const existingAccount = await this.BPAYModel.findOne({ billerCode });
        if (existingAccount) {
            throw new HttpException('Biller code already exists', 400);
        }
    
        const newBPAYacc = new this.BPAYModel({
            billerCode,
            companyName,
            referenceNumber
        });
    
        return newBPAYacc.save();
    }




    async bpayPayment(bpayDto: BPAYDto): Promise<string> {
        const { fromAccount, billerCode, referenceNumber, amount } = bpayDto;
    
        if (amount <= 0) {
            throw new HttpException('Payment amount must be greater than zero', 400);
        }
    
        // Fetch the user's account
        const sender = await this.userAccountModel.findOne({ accountNumber: fromAccount });
        if (!sender) {
            throw new HttpException('Sender account not found', 404);
        }
    
        // Fetch the BPAY account using the biller code
        const bpayAccount = await this.BPAYModel.findOne({ billerCode });
        if (!bpayAccount) {
            throw new HttpException('BPAY account not found', 404);
        }
    
        // Check if the sender has sufficient funds
        if (sender.balance < amount) {
            throw new HttpException('Insufficient funds', 400);
        }
    
        // Deduct the amount from the user's account
        sender.balance -= amount;
        await sender.save();
    
        // Create a BPAY transaction record
        const newTransaction = new this.TransactionModel({
            fromAccount,
            toAccount: `BPAY: ${bpayAccount.companyName}`,
            billerCode,
            referenceNumber,
            amount,
            date: new Date(),
        });
        await newTransaction.save();
    
        return `BPAY payment to ${bpayAccount.companyName} successful`;
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