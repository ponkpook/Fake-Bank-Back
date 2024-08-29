import { Schema, Prop, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class User {
    @Prop({unique: true})
    username: string;

    @Prop({required: false})
    account: string;

    @Prop({required: false})
    password: string;

    @Prop({required: false})
    BSB: number;

    @Prop({required: false})
    balance: number;

}

export const UserSchema = SchemaFactory.createForClass(User);