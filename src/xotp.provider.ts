import { Provider } from '@nestjs/common';
import { XOTPModuleAsyncOptions, XOTPOptionsFactory } from './xotp.interfaces';
import { XOTP_MODULE_OPTIONS } from './xotp.constants';

export function createXOTPAsyncProviders(
  options: XOTPModuleAsyncOptions,
): Provider[] {
  const provider: Provider = {
    provide: XOTP_MODULE_OPTIONS,
    useFactory: options.useFactory,
    inject: options.inject || [],
  };

  if (options.useClass || options.useExisting) {
    provider.useFactory = async (factory: XOTPOptionsFactory) =>
      factory.createXOTPModuleOptions();
    provider.inject = [options.useClass || options.useExisting];
  }

  return [provider];
}
