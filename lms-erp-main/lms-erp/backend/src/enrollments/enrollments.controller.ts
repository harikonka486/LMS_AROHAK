import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard, Roles } from '../auth/guards';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private enrollments: EnrollmentsService) {}

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.enrollments.findAll();
  }

  @Post()
  enroll(@Request() req: any, @Body('courseId') courseId: string) {
    return this.enrollments.enroll(req.user.id, courseId);
  }

  @Get('my')
  findMy(@Request() req: any) {
    return this.enrollments.findMy(req.user.id);
  }

  @Get('check/:courseId')
  check(@Request() req: any, @Param('courseId') courseId: string) {
    return this.enrollments.check(req.user.id, courseId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  unenroll(@Param('id') id: string) {
    return this.enrollments.unenroll(id);
  }
}
