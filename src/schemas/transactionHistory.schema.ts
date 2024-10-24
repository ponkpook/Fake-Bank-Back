import { Schema, Prop, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class transactionHistory {
    @Prop({required: true})
    username: string;

    @Prop({required: true})
    fromAccount: string;

    @Prop({ required: true })
    toAccount: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    time: string;
}

export const transactionHistorySchema = SchemaFactory.createForClass(transactionHistory);