import {
  Controller,
  Get,
  Post,
  Body,
  UploadedFile,
  Request,
  UseGuards,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { CoursesSimpleService } from './courses-simple.service';

const thumbnailStorage = diskStorage({
  destination: 'uploads/thumbnails',
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

@Controller('courses-simple')
export class CoursesSimpleController {
  constructor(private courses: CoursesSimpleService) {}

  @Get()
  findAll() {
    return this.courses.findAll({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.courses.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('thumbnail', { storage: thumbnailStorage }))
  async create(@Body() body: any, @UploadedFile() file: any, @Request() req: any) {
    try {
      const result = await this.courses.create(body, file, req.user.id);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
