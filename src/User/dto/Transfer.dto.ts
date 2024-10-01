import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TransferDto {
  @IsNotEmpty()
  @IsString()
  fromAccount: string;

  @IsNotEmpty()
  @IsString()
  toAccount: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
