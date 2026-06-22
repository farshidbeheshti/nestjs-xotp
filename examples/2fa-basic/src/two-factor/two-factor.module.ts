import { Module } from '@nestjs/common';
import { XOTPModule } from 'nestjs-xotp';
import { TwoFactorController } from './two-factor.controller';
import { TwoFactorService } from './two-factor.service';
import { xotpModuleOptions } from './xotp.config';

@Module({
  imports: [XOTPModule.forRoot(xotpModuleOptions)],
  controllers: [TwoFactorController],
  providers: [TwoFactorService],
})
export class TwoFactorModule {}
