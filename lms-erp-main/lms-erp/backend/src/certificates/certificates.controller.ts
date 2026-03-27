import { Controller, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

@Controller('certificates')
export class CertificatesController {
  constructor(private certs: CertificatesService) {}

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.certs.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMy(@Request() req: any) {
    return this.certs.findMy(req.user.id);
  }

  @Get('verify/:number')
  verify(@Param('number') number: string) {
    return this.certs.verify(number);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.certs.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.certs.delete(id);
  }
}
