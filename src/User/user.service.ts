import { Injectable, HttpException } from "@nestjs/common";
import * as cron from 'node-cron';
import { InjectModel } from "@nestjs/mongoose";
import { Model, NumberExpression } from 'mongoose'
import { User } from '../schemas/user.schema'
import { userAccount } from "../schemas/userAccount.schema";
import { RecurringPayment } from 'src/schemas/recurringPayments.schema';
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
        @InjectModel(existingPayee.name) private existingPayeeModel: Model<existingPayee>, 
        @InjectModel(RecurringPayment.name) private recurringPaymentModel: Model<RecurringPayment>

    ) { 
        cron.schedule('0 0 * * *', () => this.removeExpiredUsers());


    }

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
    async transferMoneyToOthers(transferDto: TransferDto): Promise<{success: boolean, message:string}> {
        const { fromAccount, toAccount, amount } = transferDto;
        if (amount <= 0) {
            return { success: false, message: 'Transfer amount must be greater than zero' };
        }
        const sender = await this.userAccountModel.findOne({ accountNumber: fromAccount });
        if (!sender) {
            return { success: false, message: 'Sender account not found' };
        }
        const recipient = await this.userAccountModel.findOne({ accountNumber: toAccount });
        if (sender.balance < amount) {
            return { success: false, message: 'Insufficient funds' };
        }
        sender.balance -= amount;
        // Save both accounts
        await Promise.all([sender.save()]);
        await this.transactionHistoryModel.create({
            username: sender.username,
            fromAccNumber: fromAccount,
            toAccNumber: toAccount,
            amount: amount,
            date: new Date(),
            time: new Date().toLocaleTimeString()
        });
        return { success: true, message: 'Transfer successful' };
    }




    async transferMoney(transferDto: TransferDto): Promise<{ success: boolean; message: string }> {
        const { fromAccount, toAccount, amount } = transferDto;
        if (amount <= 0) {
            return { success: false, message: 'Transfer amount must be greater than zero' };
        }
        const sender = await this.userAccountModel.findOne({ accountNumber: fromAccount });
        if (!sender) {
            return { success: false, message: 'Sender account not found' };
        }
        const recipient = await this.userAccountModel.findOne({ accountNumber: toAccount });
        if (!recipient) {
            return { success: false, message: 'Recipient account not found' };
        }
        if (sender.balance < amount) {
            return { success: false, message: 'Insufficient funds' };
        }
        sender.balance -= amount;
        recipient.balance += amount;
        // Save both accounts
        await Promise.all([sender.save(), recipient.save()]);

        await this.transactionHistoryModel.create({
            username: sender.username,
            fromAccNumber: fromAccount,
            toAccNumber: toAccount,
            amount: amount,
            date: new Date(),
            time: new Date().toLocaleTimeString()
        });
        return { success: true, message: 'Transfer successful' };
    }

    async getUserTransactions(username: string) {
        const transactions = await this.transactionHistoryModel.find({ username }).exec();
        return transactions;
    }

    async deposit(username: string, accountNumber: string, amount: number) {
        const account = await this.getUserAccount(username, accountNumber);
        account.balance = Number(account.balance)+Number(amount);
        await account.save();
        return;
    }


    async bpayPayment(username: String, fromAccNumber: String, billerCode: String, companyName: String, referenceNumber: String, amount: number): Promise<{success:boolean, message: string}> {
        if (amount <= 0) {
            return { success: false, message: 'Payment amount must be greater than zero' };
        }
    
        // Fetch the user's account
        const sender = await this.userAccountModel.findOne({ accountNumber: fromAccNumber });
        if (!sender) {
            return { success: false, message: 'Account not found' };
        }
    
    
        // Check if the sender has sufficient funds
        if (sender.balance < amount) {
            return { success: false, message: 'Insufficient funds' };
        }
    
        // Deduct the amount from the user's account
        sender.balance -= amount;
        await sender.save();
    
        await this.BPAYHistory.create({
            username,
            fromAccNumber,
            billerCode,
            companyName,
            referenceNumber,
            amount,
            date: new Date(),
            time: new Date().toLocaleTimeString()
        });

        await this.transactionHistoryModel.create({
            username,
            fromAccNumber,
            toAccNumber: companyName,
            amount: amount,
            date: new Date(),
            time: new Date().toLocaleTimeString()
        });

        return { success: true, message: 'BPAY payment successful' };
    }


    async checkUserExpirationStatus(username: string): Promise<number> {
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
            return -1;
        }
    
        // If the user still has time left
        return daysLeft;
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
        return this.userAccountModel.find({username});
    }
    getUserAccount(username: string, accountNumber: string) {
        return this.userAccountModel.findOne({ username, accountNumber });
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
        // Method to add a new recurring payment
    async addRecurringPayment(username: string, accountNumber: string, amount: number, startDate: Date, endDate: Date, frequency: string) {
        const account = await this.userAccountModel.findOne({ accountNumber, username });
        if (!account) {
            throw new HttpException('Account not found', 404);
        }

        const newRecurringPayment = new this.recurringPaymentModel({
            username,
            accountNumber,
            amount,
            startDate,
            endDate,
            nextPaymentDate: startDate, // First payment will be made on the start date
            frequency,
        });

        await newRecurringPayment.save();
        return `Recurring payment added for user ${username} with account ${accountNumber}.`;
    }

    // Process recurring payments daily
    async processRecurringPayments() {
        const today = new Date();

        // Fetch all recurring payments where the next payment date is today or earlier and end date is not exceeded
        const payments = await this.recurringPaymentModel.find({
            nextPaymentDate: { $lte: today },
            endDate: { $gte: today }
        });

        for (const payment of payments) {
            const account = await this.userAccountModel.findOne({ accountNumber: payment.accountNumber });
            if (!account) {
                console.log(`Account ${payment.accountNumber} not found, skipping payment.`);
                continue;
            }

            // Check if the user has enough balance
            if (account.balance < payment.amount) {
                console.log(`Insufficient funds in account ${payment.accountNumber}, skipping payment.`);
                continue;
            }

            // Deduct the amount from the user's account balance
            account.balance -= payment.amount;
            await account.save();

            // Log the payment (also create a transaction record here)
            console.log(`Processed recurring payment of ${payment.amount} for account ${payment.accountNumber}.`);

            // Create a new transaction record for this recurring payment
            await this.transactionHistoryModel.create({
                username: payment.username,
                fromAccNumber: payment.accountNumber,
                toAccNumber: "Recurring Payment",
                amount: payment.amount,
                date: new Date(),
                time: new Date().toLocaleTimeString(),
            });

            // Calculate the next payment date based on the frequency and update the recurring payment
            const nextPaymentDate = this.calculateNextPaymentDate(payment.nextPaymentDate, payment.frequency);
            await this.recurringPaymentModel.updateOne(
                { _id: payment._id },
                { nextPaymentDate }
            );
        }
    }

    calculateNextPaymentDate(currentDate: Date, frequency: string): Date {
        const nextDate = new Date(currentDate);
        switch (frequency) {
            case 'weekly':
                nextDate.setDate(currentDate.getDate() + 7); // Weekly payment
                break;
            case 'fortnightly':
                nextDate.setDate(currentDate.getDate() + 14); // Every two weeks
                break;
            case 'monthly':
                nextDate.setMonth(currentDate.getMonth() + 1); // Monthly payment
                break;
            default:
                throw new Error(`Unknown frequency: ${frequency}`);
        }
        return nextDate;
    }
}
