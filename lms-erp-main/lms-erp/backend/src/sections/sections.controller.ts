import { Controller, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

@Controller('sections')
@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')
export class SectionsController {
  constructor(private sections: SectionsService) {}

  @Post('course/:courseId')
  create(@Param('courseId') courseId: string, @Body('title') title: string) {
    return this.sections.create(courseId, title);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('title') title: string) {
    return this.sections.update(id, title);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.sections.remove(id); }
}
