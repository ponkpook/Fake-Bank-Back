import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UserModule } from './User/users.module';

@Module({
  //imports: [MongooseModule.forRoot('mongodb://localhost:27017/test'), 
  imports: [MongooseModule.forRoot('mongodb+srv://itproject:comp30022@it-project.yjfna.mongodb.net/'), 
    UserModule,],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
