import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateDocumentDto, UpdateDocumentDto } from './document.entity';
import { DocumentService } from './document.service';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @Roles('admin', 'editor')
  async create(@Req() req: any, @Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto, req.user.userId);
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.documentService.findAll(status, search, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'editor')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto, req.user.userId);
  }

  @Delete(':id')
  @Roles('admin', 'editor')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.documentService.remove(id);
  }

  @Post(':id/upload')
  @Roles('admin', 'editor')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Req() req: any,
    @Param('id') documentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('fileSize') fileSize: number,
    @Body('mimeType') mimeType: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required for upload');
    }

    return this.documentService.uploadDocument(
      documentId,
      file,
      fileSize,
      mimeType,
      req.user,
    );
  }

  @Post(':id/publish')
  @Roles('admin', 'editor')
  async publishDocument(@Param('id') documentId: string) {
    return this.documentService.publishDocument(documentId);
  }
}
