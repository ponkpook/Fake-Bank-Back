import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema()
export class Transaction extends Document {
    @Prop({ required: true })
    fromAccount: string;

    @Prop({ required: true })
    toAccount: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    date: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
