import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class RecurringPayment extends Document {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    accountName: string; // The account number to debit

    @Prop({ required: true })
    amount: number; // The amount to debit

    @Prop({ required: true })
    startDate: Date; // When the recurring payment starts

    @Prop({ required: true })
    endDate: Date; // When the recurring payment ends

    @Prop({ required: true })
    nextPaymentDate: Date; // The next payment date (updated after each payment)

    @Prop({ required: true })
    frequency: string; // "weekly", "fortnightly", "monthly"
}

export const RecurringPaymentSchema = SchemaFactory.createForClass(RecurringPayment);