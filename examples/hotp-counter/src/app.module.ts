import { Module } from '@nestjs/common';
import { HotpModule } from './hotp/hotp.module';

@Module({
  imports: [HotpModule],
})
export class AppModule {}
