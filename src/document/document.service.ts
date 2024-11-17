import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import {
  CreateDocumentDto,
  Document,
  UpdateDocumentDto,
} from './document.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, userId: string) {
    const document = this.documentRepository.create(
      createDocumentDto as Document,
    );

    const author = await this.userRepository.findOneByOrFail({ id: userId });
    document.author = author;
    document.lastUpdatedBy = author;

    return this.documentRepository.save(document);
  }

  async findAll(
    status?: string,
    search?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const query = this.documentRepository.createQueryBuilder('document');

    if (status) {
      query.andWhere('document.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(document.title ILIKE :search OR document.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    const [documents, total] = await query.getManyAndCount();

    return {
      data: documents,
      currentPage: page,
      totalCount: total,
    };
  }

  async findOne(id: string) {
    const document = await this.documentRepository.findOneBy({ id });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    userId: string,
  ) {
    const document = await this.findOne(id);
    Object.assign(document, updateDocumentDto);

    const editor = await this.userRepository.findOneByOrFail({ id: userId });
    document.lastUpdatedBy = editor;

    return this.documentRepository.save(document);
  }

  async remove(id: string) {
    const document = await this.findOne(id);
    return this.documentRepository.softRemove(document);
  }
}
