import { Body, Controller, Get, Post } from '@nestjs/common';
import { VerifyDto } from './dto/verify.dto';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Get('settings')
  getSettings() {
    return this.otpService.getSettings();
  }

  @Post('verify')
  verify(@Body() body: VerifyDto) {
    const valid = this.otpService.verify(body.secret, body.token);
    return { valid };
  }
}
