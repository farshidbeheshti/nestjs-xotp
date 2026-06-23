import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EnrollDto } from './dto/enroll.dto';
import { VerifyDto } from './dto/verify.dto';
import { HotpService } from './hotp.service';

@Controller('hotp')
export class HotpController {
  constructor(private readonly hotpService: HotpService) {}

  @Post('enroll')
  enroll(@Body() body: EnrollDto) {
    return this.hotpService.enroll(body.account);
  }

  @Get('counter/:account')
  getCounter(@Param('account') account: string) {
    return { account, counter: this.hotpService.getCounter(account) };
  }

  @Post('verify')
  verify(@Body() body: VerifyDto) {
    return this.hotpService.verify(body.account, body.token);
  }
}
