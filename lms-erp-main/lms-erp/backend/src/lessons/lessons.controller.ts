import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

const videoStorage = diskStorage({
  destination: 'uploads/videos',
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

@Controller('lessons')
export class LessonsController {
  constructor(private lessons: LessonsService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.lessons.findOne(id);
  }

  @Post('section/:sectionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('video', { storage: videoStorage }))
  create(
    @Param('sectionId') sectionId: string,
    @Body() body: any,
    @UploadedFile() file: any,
  ) {
    return this.lessons.create(sectionId, body, file);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('video', { storage: videoStorage }))
  update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file: any,
  ) {
    return this.lessons.update(id, body, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.lessons.remove(id);
  }
}
