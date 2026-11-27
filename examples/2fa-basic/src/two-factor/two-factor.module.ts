import { Module } from '@nestjs/common';
import { XotpModule } from 'nestjs-xotp';
import { TwoFactorController } from './two-factor.controller';
import { TwoFactorService } from './two-factor.service';
import { xotpModuleOptions } from './xotp.config';

@Module({
  imports: [XotpModule.forRoot(xotpModuleOptions)],
  controllers: [TwoFactorController],
  providers: [TwoFactorService],
})
export class TwoFactorModule {}
