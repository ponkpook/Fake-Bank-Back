import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createDefaultAcc {
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