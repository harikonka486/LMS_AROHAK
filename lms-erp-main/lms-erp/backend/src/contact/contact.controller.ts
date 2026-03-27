import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Controller('contact')
export class ContactController {
  constructor(private mail: MailService) {}

  @Post()
  @HttpCode(200)
  async contact(@Body() body: { name: string; email: string; phone?: string; message: string }) {
    const { name, email, phone, message } = body;
    if (!name || !email || !message) {
      return { error: 'Name, email and message are required' };
    }
    await this.mail.sendContact(name, email, phone || '', message);
    return { message: 'Message sent successfully' };
  }
}
