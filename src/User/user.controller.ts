import { Controller, Post, Body, UsePipes, ValidationPipe, Get, Param, HttpException, Patch, Delete, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { createUserDto } from "./dto/CreateUser.dto";
import mongoose, { Mongoose } from "mongoose";
import { UpdateUserDto } from "./dto/UpdateUser.dto";
import { TransferDto } from './dto/Transfer.dto';

@Controller('user')
export class UserController {

    constructor(private userService: UserService){}

    @Post()
    @UsePipes(new ValidationPipe())
    createUser(@Body() createUserDto: createUserDto){
        console.log(createUserDto);
        return this.userService.createUser(createUserDto);
    }

    @Get()
    getUsers(){
        return this.userService.getUsers()
    }

    @Get(':username')
    async getUser(@Param('username') username: string) {
        const findUser = await this.userService.getUser(username);
        if(!findUser) throw new HttpException('User not found', 404);
        return findUser;
    }

    @Get(':username/accounts')
    async getUserAccounts(@Param('username') username: string) {
        const findUser = await this.userService.getUserAccounts(username);
        if(!findUser) throw new HttpException('User not found', 404);
        return findUser;
    }

    @Get(':username/transactions')
    async getUserAccount(@Param('username') username: string, @Param('accountNumber') accountNumber: string) {
        const transactions = await this.userService.getUserTransactions(username);
        if (!transactions) throw new HttpException('User not found', 404);
        return transactions;
    }

    @Post(':username/newAccount')
    async newAccount(@Query('username') username: string, @Query('accountName') accountName: string, @Query('balance') balance: number) {
        const newAccount = await this.userService.addNewAccount(username, accountName, balance);
        return newAccount;
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe())
    async updateUser(@Param('id') id:string, @Body() UpdateUserDto: UpdateUserDto){
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if(!isValid) throw new HttpException('Invalid ID', 400);
        const updatedUser = await this.userService.updateUser(id, UpdateUserDto);
        console.log(updatedUser);
        if(!updatedUser) throw new HttpException('User not found', 404);
        return updatedUser;

    }

    @Delete(':username')
    async deleteUser(@Param('username') username: string){
        await this.userService.deleteUser(username);
    }

    @Post(':username/transfer')
    @UsePipes(new ValidationPipe())
    async transfer(@Body() transferDto: TransferDto) {
        return this.userService.transferMoney(transferDto);
    }

    @Patch(':username/deposit')
    async deposit(@Query('username') username: string, @Query('accountNumber') accountNumber: string, @Query('amount') amount: number) {
        return this.userService.deposit(username, accountNumber, amount);
    }

    @Post(':username/BPAY')
    @UsePipes(new ValidationPipe())
    async bpayPayment(@Query('username') username: string, @Query('accountNumber') accountNumber: string, @Query('amount') amount: number, @Query('billerCode') billerCode: string, @Query('companyName') companyName: string, @Query('referenceNumber') referenceNumber: string): Promise<string> {
        return this.userService.bpayPayment(username, accountNumber, billerCode, companyName, referenceNumber, amount);
    }
    
}