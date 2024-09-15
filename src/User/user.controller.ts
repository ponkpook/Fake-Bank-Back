import { Controller, Post, Body, UsePipes, ValidationPipe, Get, Param, HttpException, Patch, Delete } from "@nestjs/common";
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

    @Delete(':id')
    async deleteUser(@Param('id') id: string){
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if(!isValid) throw new HttpException('Invalid ID', 400);
        const deletedUser = await this.userService.deleteUser(id);
        console.log(deletedUser);
        
    }

    @Post('transfer')
    @UsePipes(new ValidationPipe())
    async transfer(@Body() transferDto: TransferDto) {
        return this.userService.transferMoney(transferDto);
    }

}