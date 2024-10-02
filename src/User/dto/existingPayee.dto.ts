import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class payeeDTO {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsString()
    @IsOptional()
    payeeName: string;

    @IsString()
    accountNumber: string;

    @IsString()
    BSB: string;
}