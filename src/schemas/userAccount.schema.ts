import { Schema, Prop, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class userAccount {
    @Prop({required: true})
    username: string;

    @Prop({ required: true })
    accountName: string;
        
    @Prop({ required: true})
    accountNumber: string;
        
    @Prop({required: true})
    BSB: string;

    @Prop({required: true})
    balance: number;
}

export const userAccountSchema = SchemaFactory.createForClass(userAccount);