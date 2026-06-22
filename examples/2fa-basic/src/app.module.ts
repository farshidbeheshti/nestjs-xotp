import { Module } from '@nestjs/common';
import { TwoFactorModule } from './two-factor/two-factor.module';

@Module({
  imports: [TwoFactorModule],
})
export class AppModule {}
