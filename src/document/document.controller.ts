import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
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
  @Roles('admin')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
