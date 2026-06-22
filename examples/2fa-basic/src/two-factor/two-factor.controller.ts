import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EnrollDto } from './dto/enroll.dto';
import { VerifyDto } from './dto/verify.dto';
import { TwoFactorService } from './two-factor.service';

@Controller('2fa')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('enroll')
  enroll(@Body() body: EnrollDto) {
    return this.twoFactorService.enroll(body.account);
  }

  @Get('key-uri/:account')
  getKeyUri(@Param('account') account: string) {
    return { account, keyUri: this.twoFactorService.getKeyUri(account) };
  }

  @Post('verify')
  verify(@Body() body: VerifyDto) {
    const valid = this.twoFactorService.verify(body.account, body.token);
    return { valid };
  }
}
