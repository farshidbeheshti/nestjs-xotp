import { Module } from '@nestjs/common';
import { XOTPModule } from 'nestjs-xotp';
import { OtpConfigModule, OtpConfigService } from './otp-config.module';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

@Module({
  imports: [
    OtpConfigModule,
    XOTPModule.forRootAsync({
      imports: [OtpConfigModule],
      useExisting: OtpConfigService,
    }),
  ],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
