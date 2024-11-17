import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { Document } from './document.entity';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, User])],
  providers: [DocumentService],
  controllers: [DocumentController],
})
export class DocumentModule {}
