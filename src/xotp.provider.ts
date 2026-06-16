import { Provider } from '@nestjs/common';
import { XOTPModuleAsyncOptions, XOTPOptionsFactory } from './xotp.interfaces';
import { XOTP_MODULE_OPTIONS } from './xotp.constants';

export function createXOTPAsyncProviders(
  options: XOTPModuleAsyncOptions,
): Provider[] {
  const providers: Provider[] = [];

  if (options.useClass) {
    providers.push({
      provide: options.useClass,
      useClass: options.useClass,
    });
  }

  const optionsProvider: Provider = {
    provide: XOTP_MODULE_OPTIONS,
    useFactory: options.useFactory,
    inject: options.inject || [],
  };

  if (options.useClass || options.useExisting) {
    optionsProvider.useFactory = async (factory: XOTPOptionsFactory) =>
      factory.createXOTPModuleOptions();
    optionsProvider.inject = [options.useClass || options.useExisting];
  }

  providers.push(optionsProvider);
  return providers;
}
