import { Module } from '@nestjs/common';
import { CoursesSimpleController } from './courses-simple.controller';
import { CoursesSimpleService } from './courses-simple.service';

@Module({
  controllers: [CoursesSimpleController],
  providers: [CoursesSimpleService],
  exports: [CoursesSimpleService],
})
export class CoursesSimpleModule {}
