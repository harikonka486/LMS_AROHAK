import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CoursesService } from './courses.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

const thumbnailStorage = diskStorage({
  destination: 'uploads/thumbnails',
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

@Controller('courses')
export class CoursesController {
  constructor(private courses: CoursesService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.courses.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findMy(@Request() req: any) {
    return this.courses.findMy(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courses.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('thumbnail', { storage: thumbnailStorage }))
  async create(@Body() body: any, @UploadedFile() file: any, @Request() req: any) {
    return this.courses.create(body, file, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('thumbnail', { storage: thumbnailStorage }))
  update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    return this.courses.update(id, body, file, req.user);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  togglePublish(@Param('id') id: string, @Request() req: any) {
    return this.courses.togglePublish(id, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.courses.remove(id, req.user);
  }
}
