import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultDataSource } from './common/datasource';

@Module({
  imports: [TypeOrmModule.forRoot(DefaultDataSource.options)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
