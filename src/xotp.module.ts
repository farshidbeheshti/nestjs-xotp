import { DynamicModule, Module } from '@nestjs/common';
import { XotpService, XotpHotpService, XotpTotpService } from './services';
import { XOTP_MODULE_OPTIONS } from './xotp.constants';
import { XOTPForRootOptions, XOTPModuleAsyncOptions } from './xotp.interfaces';
import { createXOTPAsyncProviders } from './xotp.provider';

@Module({
  providers: [XotpService, XotpTotpService, XotpHotpService],
  exports: [XotpService, XotpTotpService, XotpHotpService],
})
export class XotpModule {
  public static forRoot(options?: XOTPForRootOptions): DynamicModule {
    return {
      global: options?.global,
      module: XotpModule,
      providers: [
        {
          provide: XOTP_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  public static forRootAsync(options: XOTPModuleAsyncOptions): DynamicModule {
    return {
      global: options.global,
      module: XotpModule,
      imports: options.imports,
      providers: createXOTPAsyncProviders(options),
    };
  }
}
