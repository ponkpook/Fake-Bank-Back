import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../schemas/user.schema";
import { userAccount, userAccountSchema } from "../schemas/userAccount.schema";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { transactionHistory, transactionHistorySchema } from "../schemas/transactionHistory.schema";
import { BPAYHistory, BPAYSchema } from "../schemas/BPAY.schema";
import { existingPayee, existingPayeeSchema } from "../schemas/existingPayee.schema";
import { RecurringPayment, RecurringPaymentSchema } from "../schemas/recurringPayments.schema";
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
        {
            name: existingPayee.name,
            schema: existingPayeeSchema
        },         
        {
            name: RecurringPayment.name,
            schema: RecurringPaymentSchema
        }
        ])
    ],
    providers: [UserService], 
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule {}