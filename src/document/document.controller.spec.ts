import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { CreateDocumentDto, UpdateDocumentDto } from './document.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DocumentController', () => {
  let documentController: DocumentController;
  let documentService: DocumentService;

  const mockDocumentService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    uploadDocument: jest.fn(),
    publishDocument: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    documentController = module.get<DocumentController>(DocumentController);
    documentService = module.get<DocumentService>(DocumentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(documentController).toBeDefined();
  });

  describe('create', () => {
    it('should call documentService.create and return the result', async () => {
      const mockCreateDto: CreateDocumentDto = {
        title: 'Test Document',
        description: 'Description of the document',
      };
      const mockUser = { userId: '123' };
      const result = { id: '1', ...mockCreateDto };

      mockDocumentService.create.mockResolvedValue(result);

      expect(
        await documentController.create({ user: mockUser }, mockCreateDto),
      ).toEqual(result);
      expect(mockDocumentService.create).toHaveBeenCalledWith(
        mockCreateDto,
        mockUser.userId,
      );
    });
  });

  describe('findAll', () => {
    it('should call documentService.findAll with query parameters and return the result', async () => {
      const result = {
        data: [],
        currentPage: 1,
        totalCount: 0,
      };

      mockDocumentService.findAll.mockResolvedValue(result);

      expect(
        await documentController.findAll('PUBLISHED', 'Test', 1, 10),
      ).toEqual(result);
      expect(mockDocumentService.findAll).toHaveBeenCalledWith(
        'PUBLISHED',
        'Test',
        1,
        10,
      );

      expect(await documentController.findAll('PUBLISHED', 'Test')).toEqual(
        result,
      );
      expect(mockDocumentService.findAll).toHaveBeenCalledWith(
        'PUBLISHED',
        'Test',
        1,
        10,
      );
    });
  });

  describe('findOne', () => {
    it('should call documentService.findOne and return the result', async () => {
      const result = { id: '1', title: 'Test Document' };

      mockDocumentService.findOne.mockResolvedValue(result);

      expect(await documentController.findOne('1')).toEqual(result);
      expect(mockDocumentService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if the document is not found', async () => {
      mockDocumentService.findOne.mockRejectedValue(
        new NotFoundException('Document not found'),
      );

      await expect(documentController.findOne('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should call documentService.update and return the result', async () => {
      const mockUpdateDto: UpdateDocumentDto = { title: 'Updated Document' };
      const mockUser = { userId: '123' };
      const result = { id: '1', ...mockUpdateDto };

      mockDocumentService.update.mockResolvedValue(result);

      expect(
        await documentController.update({ user: mockUser }, '1', mockUpdateDto),
      ).toEqual(result);
      expect(mockDocumentService.update).toHaveBeenCalledWith(
        '1',
        mockUpdateDto,
        mockUser.userId,
      );
    });
  });

  describe('remove', () => {
    it('should call documentService.remove and return the result', async () => {
      const result = { id: '1', status: 'ARCHIVED' };

      mockDocumentService.remove.mockResolvedValue(result);

      expect(await documentController.remove({ user: {} }, '1')).toEqual(
        result,
      );
      expect(mockDocumentService.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('uploadDocument', () => {
    it('should call documentService.uploadDocument and return the result', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test content'),
      } as Express.Multer.File;
      const mockUser = { userId: '123', roles: ['editor'] };
      const result = {
        message: 'File uploaded successfully',
        fileUrl: 'http://example.com/test.pdf',
      };

      mockDocumentService.uploadDocument.mockResolvedValue(result);

      expect(
        await documentController.uploadDocument(
          { user: mockUser },
          '1',
          mockFile,
          1024,
          'application/pdf',
        ),
      ).toEqual(result);
      expect(mockDocumentService.uploadDocument).toHaveBeenCalledWith(
        '1',
        mockFile,
        1024,
        'application/pdf',
        mockUser,
      );
    });

    it('should throw BadRequestException if no file is uploaded', async () => {
      const mockUser = { userId: '123', roles: ['editor'] };

      await expect(
        documentController.uploadDocument(
          { user: mockUser },
          '1',
          null,
          1024,
          'application/pdf',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('publishDocument', () => {
    it('should call documentService.publishDocument and return the result', async () => {
      const result = { id: '1', status: 'PUBLISHED' };

      mockDocumentService.publishDocument.mockResolvedValue(result);

      expect(await documentController.publishDocument('1')).toEqual(result);
      expect(mockDocumentService.publishDocument).toHaveBeenCalledWith('1');
    });
  });
});
