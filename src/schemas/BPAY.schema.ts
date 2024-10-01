import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class BPAYHistory {
    @Prop({required: true})
    username: string;

    @Prop({required: true})
    fromAccNumber: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true, unique: true })
    billerCode: string; // Unique code for each BPAY company

    @Prop({ required: true })
    companyName: string; // Name of the company

    @Prop({ required: true })
    referenceNumber: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    time: string;
}

export const BPAYSchema = SchemaFactory.createForClass(BPAYHistory);
