import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private enrollments: EnrollmentsService) {}

  @Post()
  enroll(@Request() req: any, @Body('courseId') courseId: string) {
    return this.enrollments.enroll(req.user.id, courseId);
  }

  @Get('my')
  findMy(@Request() req: any) { return this.enrollments.findMy(req.user.id); }

  @Get('check/:courseId')
  check(@Request() req: any, @Param('courseId') courseId: string) {
    return this.enrollments.check(req.user.id, courseId);
  }
}
