import {IsOptional, IsString, IsNumber} from 'class-validator'

export class UpdateUserDto{

    @IsOptional()
    @IsString()
    account?: string;

    
    @IsOptional()
    @IsString()
    password: string;

    @IsNumber()
    @IsOptional()
    BSB: number;

    @IsNumber()
    @IsOptional()
    balance: number;

}