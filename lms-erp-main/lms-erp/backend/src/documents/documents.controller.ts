import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

const documentStorage = diskStorage({
  destination: 'uploads/documents',
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

@Controller('documents')
export class DocumentsController {
  constructor(private documents: DocumentsService) {}

  @Post('course/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', { storage: documentStorage }))
  uploadDocument(
    @Param('courseId') courseId: string,
    @Body() body: any,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    return this.documents.upload(courseId, body, file, req.user);
  }

  @Get('course/:courseId')
  findCourseDocuments(@Param('courseId') courseId: string) {
    return this.documents.findByCourse(courseId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteDocument(@Param('id') id: string, @Request() req: any) {
    return this.documents.delete(id, req.user);
  }
}
