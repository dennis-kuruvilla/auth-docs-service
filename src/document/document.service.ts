import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getEnvOrThrow } from '../common/utils/env';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import {
  CreateDocumentDto,
  Document,
  DocumentStatus,
  UpdateDocumentDto,
} from './document.entity';

@Injectable()
export class DocumentService {
  private s3Client: S3Client;

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.s3Client = new S3Client({
      region: getEnvOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: getEnvOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnvOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

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
    document.status = DocumentStatus.ARCHIVED;
    return this.documentRepository.softRemove(document);
  }

  async uploadDocument(
    documentId: string,
    file: Express.Multer.File,
    fileSize: number,
    mimeType: string,
    user: { userId: string; roles: string[] },
  ) {
    const document = await this.documentRepository.findOneBy({
      id: documentId,
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.author.id !== user.userId && !user.roles.includes('admin')) {
      throw new BadRequestException(
        `Only document creator or admin can upload document!`,
      );
    }

    const fileKey = `documents/${Date.now()}-${file.originalname}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: mimeType,
      ContentLength: fileSize,
      ACL: 'public-read' as ObjectCannedACL,
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
      document.fileUrl = fileUrl;
      document.fileSize = fileSize;
      document.mimeType = mimeType;

      await this.documentRepository.save(document);

      return {
        message: 'File uploaded successfully',
        fileUrl: document.fileUrl,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async publishDocument(documentId: string) {
    const document = await this.documentRepository.findOneBy({
      id: documentId,
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.fileUrl) {
      throw new BadRequestException(`Document not uploaded yet!`);
    }

    document.status = DocumentStatus.PUBLISHED;
    document.publishedAt = new Date();

    //send the document for ingestion here

    return await this.documentRepository.save(document);
  }
}
