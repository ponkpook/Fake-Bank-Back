import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schemas/user.schema";
import { userAccount, userAccountSchema } from "src/schemas/userAccount.schema";
import { Transaction, TransactionSchema } from "src/schemas/transaction.schema";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { BPAY, BPAYSchema } from "src/schemas/BPAY.schema"; // Add BPAY schema

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: User.name,
            schema: UserSchema
        }, {
            name: userAccount.name,
            schema: userAccountSchema
        }, {
            name: Transaction.name,
            schema: TransactionSchema
        }, { 
            name: BPAY.name, 
            schema: BPAYSchema 
        }])
    ],
    providers: [UserService], 
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule {}