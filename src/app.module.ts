import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultDataSource } from './common/datasource';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot(DefaultDataSource.options),AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
