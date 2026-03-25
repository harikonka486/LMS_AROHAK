import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private quizzes: QuizzesService) {}

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.quizzes.findByCourse(courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.quizzes.findOne(id, req.user.role);
  }

  @Post('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Param('courseId') courseId: string, @Body() body: any) {
    return this.quizzes.create(courseId, body);
  }

  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @Body('answers') answers: number[],
    @Request() req: any,
  ) {
    return this.quizzes.submit(id, answers, req.user.id);
  }
}
