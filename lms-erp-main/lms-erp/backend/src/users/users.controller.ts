import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  findAll() { return this.users.findAll(); }

  @Get('stats')
  stats() { return this.users.getStats(); }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.users.importCsv(file.buffer);
  }

  @Patch(':id/role')
  changeRole(@Param('id') id: string, @Body('role') role: string) {
    return this.users.changeRole(id, role);
  }

  @Get(':id/progress')
  progress(@Param('id') id: string) { return this.users.getUserProgress(id); }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.users.deleteUser(id, req.user.id);
  }
}
