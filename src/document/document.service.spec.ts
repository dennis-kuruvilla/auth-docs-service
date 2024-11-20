import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { Document, DocumentStatus } from './document.entity';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { mockDeep } from 'jest-mock-extended';
import { SelectQueryBuilder } from 'typeorm';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn(),
      };
    }),
    PutObjectCommand: jest.fn(),
  };
});

describe('DocumentService', () => {
  let service: DocumentService;
  let documentRepository: Repository<Document>;
  let userRepository: Repository<User>;
  let s3Client: S3Client;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDeep<Repository<Document>>(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockDeep<Repository<User>>(),
        },
        {
          provide: S3Client,
          useValue: mockDeep<S3Client>(),
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentRepository = module.get<Repository<Document>>(
      getRepositoryToken(Document),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    s3Client = module.get<S3Client>(S3Client);
  });

  it('should create a new document', async () => {
    const createDocumentDto = {
      title: 'New Document',
      description: 'Document description',
    };
    const userId = 'user-id';
    const mockDocument = { id: '1', ...createDocumentDto };
    const mockUser = { id: userId, name: 'John Doe' };

    jest
      .spyOn(userRepository, 'findOneByOrFail')
      .mockResolvedValue(mockUser as any);
    jest
      .spyOn(documentRepository, 'create')
      .mockReturnValue(mockDocument as any);
    jest
      .spyOn(documentRepository, 'save')
      .mockResolvedValue(mockDocument as any);

    const result = await service.create(createDocumentDto, userId);

    expect(result).toEqual(mockDocument);
  });

  it('should return paginated documents', async () => {
    const result = {
      data: [{ id: '1', title: 'Document 1' }],
      currentPage: 1,
      totalCount: 1,
    };
    jest
      .spyOn(documentRepository, 'createQueryBuilder')
      .mockImplementation(() => {
        const queryBuilder = {
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest
            .fn()
            .mockResolvedValue([result.data, result.totalCount]),
          andWhere: jest.fn().mockReturnThis(),
        } as unknown as SelectQueryBuilder<Document>;

        return queryBuilder;
      });

    const documents = await service.findAll('active', 'doc', 1, 10);

    expect(documents).toEqual(result);
  });

  it('should return a document if found', async () => {
    const document = { id: '1', title: 'Document 1' };
    jest
      .spyOn(documentRepository, 'findOneBy')
      .mockResolvedValue(document as any);

    const result = await service.findOne('1');

    expect(result).toEqual(document);
  });

  it('should throw NotFoundException if document not found', async () => {
    jest.spyOn(documentRepository, 'findOneBy').mockResolvedValue(null);

    await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
  });

  it('should update a document', async () => {
    const updateDocumentDto = { title: 'Updated Document' };
    const userId = 'user-id';
    const mockDocument = { id: '1', title: 'Old Document' };
    const updatedDocument = { id: '1', title: 'Updated Document' };

    jest
      .spyOn(documentRepository, 'findOneBy')
      .mockResolvedValue(mockDocument as any);
    jest
      .spyOn(documentRepository, 'save')
      .mockResolvedValue(updatedDocument as any);
    jest
      .spyOn(userRepository, 'findOneByOrFail')
      .mockResolvedValue({ id: userId } as any);

    const result = await service.update('1', updateDocumentDto, userId);

    expect(result).toEqual(updatedDocument);
  });

  it('should soft remove a document', async () => {
    const mockDocument = { id: '1', status: 'active' };
    jest
      .spyOn(documentRepository, 'findOneBy')
      .mockResolvedValue(mockDocument as any);
    jest
      .spyOn(documentRepository, 'softRemove')
      .mockResolvedValue(mockDocument as any);

    const result = await service.remove('1');

    expect(result).toEqual(mockDocument);
  });

  it('should upload a document to S3 and save URL', async () => {
    const mockFile = {
      originalname: 'file.txt',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;
    const user = { userId: 'user-id', roles: ['editor'] };
    const documentId = '1';
    const mockDocument = {
      id: '1',
      fileUrl: '',
      fileSize: 123,
      mimeType: 'text/plain',
      author: {
        id: 'user-id',
      },
    };
    const fileSize = 123;
    const mimeType = 'text/plain';

    jest
      .spyOn(documentRepository, 'findOneBy')
      .mockResolvedValue(mockDocument as any);

    const sendMock = jest.fn().mockResolvedValue({});
    (S3Client.prototype.send as jest.Mock) = sendMock;

    jest
      .spyOn(documentRepository, 'save')
      .mockResolvedValue({ ...mockDocument, fileUrl: `file/url` } as Document);

    const result = await service.uploadDocument(
      documentId,
      mockFile,
      fileSize,
      mimeType,
      user,
    );

    expect(result.message).toBe('File uploaded successfully');
  });

  it('should throw NotFoundException if document not found for upload', async () => {
    const mockFile = {
      originalname: 'file.txt',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;
    const user = { userId: 'user-id', roles: ['editor'] };
    jest.spyOn(documentRepository, 'findOneBy').mockResolvedValue(null);

    await expect(
      service.uploadDocument('1', mockFile, 123, 'text/plain', user),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if user is not the author or admin', async () => {
    const mockFile = {
      originalname: 'file.txt',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;
    const user = { userId: '2', roles: ['editor'] };
    const mockDocument = { id: '1', author: { id: '1' } };

    jest
      .spyOn(documentRepository, 'findOneBy')
      .mockResolvedValue(mockDocument as any);

    await expect(
      service.uploadDocument('1', mockFile, 123, 'text/plain', user),
    ).rejects.toThrow(BadRequestException);
  });

  it('should publish a document', async () => {
    const mockDocument = { id: '1', fileUrl: 'url', status: 'draft' };
    jest
      .spyOn(documentRepository, 'findOneBy')
      .mockResolvedValue(mockDocument as any);
    jest.spyOn(documentRepository, 'save').mockResolvedValue({
      ...mockDocument,
      status: DocumentStatus.PUBLISHED,
    } as Document);

    const result = await service.publishDocument('1');

    expect(result.status).toBe(DocumentStatus.PUBLISHED);
  });

  it('should throw NotFoundException if document not found for publishing', async () => {
    jest.spyOn(documentRepository, 'findOneBy').mockResolvedValue(null);

    await expect(service.publishDocument('1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException if document is not uploaded yet', async () => {
    const mockDocument = { id: '1', status: 'draft', fileUrl: null };
    jest
      .spyOn(documentRepository, 'findOneBy')
      .mockResolvedValue(mockDocument as any);

    await expect(service.publishDocument('1')).rejects.toThrow(
      BadRequestException,
    );
  });
});
