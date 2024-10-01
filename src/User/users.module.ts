import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schemas/user.schema";
import { userAccount, userAccountSchema } from "src/schemas/userAccount.schema";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { transactionHistory, transactionHistorySchema } from "src/schemas/transactionHistory.schema";
import { BPAYHistory, BPAYSchema } from "src/schemas/BPAY.schema";
@Module({
    imports: [
        MongooseModule.forFeature([
        {
            name: User.name,
            schema: UserSchema
        },
        {
            name: userAccount.name,
            schema: userAccountSchema
        },
        {
            name: transactionHistory.name,
            schema: transactionHistorySchema
        },
        {
            name: BPAYHistory.name,
            schema: BPAYSchema
        },
        ])
    ],
    providers: [UserService], 
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule {}