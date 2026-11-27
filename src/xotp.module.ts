import { DynamicModule, Module } from '@nestjs/common';
import { XotpService, XotpHotpService, XotpTotpService } from './services';
import { XOTP_MODULE_OPTIONS } from './xotp.constants';
import { XOTPModuleAsyncOptions, XOTPModuleOptions } from './xotp.interfaces';
import { createXOTPAsyncProviders } from './xotp.provider';

@Module({
  providers: [XotpService, XotpTotpService, XotpHotpService],
  exports: [XotpService, XotpTotpService, XotpHotpService],
})
export class XotpModule {
  public static forRoot(options?: XOTPModuleOptions): DynamicModule {
    return {
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
      module: XotpModule,
      imports: options.imports,
      providers: createXOTPAsyncProviders(options),
    };
  }
}
