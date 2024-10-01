import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsString()
    @IsOptional()
    password: string;

    @IsString()
    isAdmin: boolean;

    @IsString()
    date: Date;
}