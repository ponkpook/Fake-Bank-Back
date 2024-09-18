import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class BPAY extends Document {
    @Prop({ required: true, unique: true })
    billerCode: string; // Unique code for each BPAY company

    @Prop({ required: true })
    companyName: string; // Name of the company

    @Prop({ required: true })
    referenceNumber: string;
}

export const BPAYSchema = SchemaFactory.createForClass(BPAY);
