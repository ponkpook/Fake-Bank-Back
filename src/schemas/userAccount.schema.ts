import { Schema, Prop, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class userAccount {
    @Prop({unique: true})
    username: string;

    @Prop({ required: true})
    accountNumber: string;
        
    @Prop({required: true})
    BSB: number;

    @Prop({required: true})
    balance: number;
}

export const UserSchema = SchemaFactory.createForClass(userAccount);