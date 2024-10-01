import { Schema, Prop, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class User {
    @Prop({unique: true})
    username: string;

    @Prop({required: true})
    password: string;

    @Prop({ required: true })
    isAdmin: boolean;

    @Prop({ required: true })
    date: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);