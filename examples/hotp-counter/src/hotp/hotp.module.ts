import { Module } from '@nestjs/common';
import { XOTPModule } from 'nestjs-xotp';
import { HotpController } from './hotp.controller';
import { HotpService } from './hotp.service';
import { xotpModuleOptions } from './xotp.config';

@Module({
  imports: [XOTPModule.forRoot(xotpModuleOptions)],
  controllers: [HotpController],
  providers: [HotpService],
})
export class HotpModule {}
