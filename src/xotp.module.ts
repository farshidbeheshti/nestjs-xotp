import { DynamicModule, Module } from '@nestjs/common';
import { XOTPService, XOTPHOTPService, XOTPTOTPService } from './services';
import { XOTP_MODULE_OPTIONS } from './xotp.constants';
import { XOTPModuleAsyncOptions, XOTPModuleOptions } from './xotp.interfaces';
import { createXOTPAsyncProviders } from './xotp.provider';

@Module({
  providers: [XOTPService, XOTPTOTPService, XOTPHOTPService],
  exports: [XOTPService, XOTPTOTPService, XOTPHOTPService],
})
export class XOTPModule {
  public static forRoot(options?: XOTPModuleOptions): DynamicModule {
    return {
      module: XOTPModule,
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
      module: XOTPModule,
      providers: createXOTPAsyncProviders(options),
    };
  }
}
