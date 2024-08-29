import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    account: string;

    @IsString()
    @IsOptional()
    password: string;

    @IsNumber()
    @IsOptional()
    BSB: number;

    @IsNumber()
    @IsOptional()
    balance: number;
}