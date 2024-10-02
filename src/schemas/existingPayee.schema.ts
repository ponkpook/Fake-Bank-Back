import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class existingPayee {
    @Prop({required: true})
    username: string;

    @Prop({ required: true })
    payeeName: string;

    @Prop({ required: true })
    accountNumber: string;

    @Prop({ required: true })
    BSB: string;
}

export const existingPayeeSchema = SchemaFactory.createForClass(existingPayee);
