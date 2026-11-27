import { Module } from '@nestjs/common';
import { XotpModule } from 'nestjs-xotp';
import { HotpController } from './hotp.controller';
import { HotpService } from './hotp.service';
import { xotpModuleOptions } from './xotp.config';

@Module({
  imports: [XotpModule.forRoot(xotpModuleOptions)],
  controllers: [HotpController],
  providers: [HotpService],
})
export class HotpModule {}
