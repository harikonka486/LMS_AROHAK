import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('certificates')
export class CertificatesController {
  constructor(private certs: CertificatesService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMy(@Request() req: any) { return this.certs.findMy(req.user.id); }

  @Get('verify/:number')
  verify(@Param('number') number: string) { return this.certs.verify(number); }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) { return this.certs.findOne(id); }
}
