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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateDocumentDto, UpdateDocumentDto } from './document.entity';
import { DocumentService } from './document.service';

@Controller('documents')
@ApiTags('Document Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: '*ADMIN/EDITOR* Create a Document' })
  @Roles('admin', 'editor')
  async create(@Req() req: any, @Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all Documents' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.documentService.findAll(status, search, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Document details' })
  async findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '*ADMIN/EDITOR* Edit Document info' })
  @Roles('admin', 'editor')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '*ADMIN/EDITOR* Delete a Document' })
  @Roles('admin', 'editor')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.documentService.remove(id);
  }

  @Post(':id/upload')
  @ApiOperation({
    summary:
      '*ADMIN/EDITOR* Upload a Document (please send form-data from postman)',
  })
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
  @ApiOperation({ summary: '*ADMIN/EDITOR* Publish a Document' })
  @Roles('admin', 'editor')
  async publishDocument(@Param('id') documentId: string) {
    return this.documentService.publishDocument(documentId);
  }
}
