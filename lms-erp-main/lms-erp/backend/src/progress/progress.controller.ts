import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progress: ProgressService) {}

  @Post('lesson/:lessonId/complete')
  complete(@Param('lessonId') lessonId: string, @Request() req: any) {
    return this.progress.completeLesson(lessonId, req.user.id);
  }

  @Get('course/:courseId')
  getCourse(@Param('courseId') courseId: string, @Request() req: any) {
    return this.progress.getCourseProgress(courseId, req.user.id);
  }
}
