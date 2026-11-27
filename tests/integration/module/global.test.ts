import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { XotpModule, XotpService } from '../../../src';

@Injectable()
class FeatureService {
  constructor(public readonly xotp: XotpService) {}
}

// Deliberately does not import XotpModule.
@Module({ providers: [FeatureService] })
class FeatureModule {}

async function compile(xotpModule: ReturnType<typeof XotpModule.forRoot>) {
  return Test.createTestingModule({
    imports: [xotpModule, FeatureModule],
  }).compile();
}

describe('XotpModule global option', () => {
  it('forRoot({ global: true }) makes the services available everywhere', async () => {
    const module = await compile(XotpModule.forRoot({ global: true }));

    try {
      expect(module.get(FeatureService).xotp).toBe(module.get(XotpService));
    } finally {
      await module.close();
    }
  });

  it('forRootAsync({ global: true }) makes the services available everywhere', async () => {
    const module = await compile(
      XotpModule.forRootAsync({ global: true, useFactory: () => ({}) }),
    );

    try {
      expect(module.get(FeatureService).xotp).toBe(module.get(XotpService));
    } finally {
      await module.close();
    }
  });

  it('is not global by default', async () => {
    await expect(compile(XotpModule.forRoot())).rejects.toThrow(/XotpService/);
    await expect(
      compile(XotpModule.forRootAsync({ useFactory: () => ({}) })),
    ).rejects.toThrow(/XotpService/);
  });
});
