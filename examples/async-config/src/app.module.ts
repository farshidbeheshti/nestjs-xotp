import { Module } from '@nestjs/common';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [OtpModule],
})
export class AppModule {}
