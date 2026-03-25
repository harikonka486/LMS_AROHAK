import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { ProgressModule } from '../progress/progress.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [ProgressModule, MailModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
