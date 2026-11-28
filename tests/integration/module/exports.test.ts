import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Secret } from 'xotp';
import { XotpModule, XotpService } from '../../../src';
import {
  RFC4226_HOTP_COUNTER_0,
  RFC4226_SECRET,
} from '../../fixtures/rfc-secrets';

@Injectable()
class ConsumerService {
  constructor(private readonly xotpService: XotpService) {}

  async generateHotp() {
    const secret = Secret.from(RFC4226_SECRET, 'ascii');
    return this.xotpService.hotp.generate({ secret, counter: 0 });
  }
}

@Module({
  imports: [
    XotpModule.forRoot({
      hotp: { algorithm: 'sha1', digits: 6 },
    }),
  ],
  providers: [ConsumerService],
})
class AppModule {}

describe('XotpModule exports', () => {
  it('allows injecting XotpService into a consumer module', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    try {
      expect(await module.get(ConsumerService).generateHotp()).toBe(
        RFC4226_HOTP_COUNTER_0,
      );
    } finally {
      await module.close();
    }
  });
});
