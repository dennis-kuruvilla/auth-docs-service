import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultDataSource } from './common/datasource';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(DefaultDataSource.options),
    AuthModule,
    UserModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
