import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class BPAYDto {
    @IsNotEmpty()
    @IsString()
    fromAccount: string;  // User's account number

    @IsNotEmpty()
    @IsString()
    billerCode: string;  // Biller code of the company

    @IsNotEmpty()
    @IsString()
    referenceNumber: string;  // Reference number for the BPAY payment

    @IsNotEmpty()
    @IsNumber()
    amount: number;  // Amount to be paid
}
