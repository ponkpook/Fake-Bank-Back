import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createtAcc {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsString()
    accountName: string;

    @IsString()
    accountNumber: string;

    @IsString()
    BSB: string;

    @IsNumber()
    balance: number;
}