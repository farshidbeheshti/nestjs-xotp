import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { HOTPOptions, TOTPOptions } from 'xotp';

export type XotpModuleOptions = Partial<TOTPOptions> &
  Partial<HOTPOptions> & { hotp?: Partial<HOTPOptions> } & {
    totp?: Partial<TOTPOptions>;
  };

export type XotpForRootOptions = XotpModuleOptions & {
  global?: boolean;
};

export interface XotpOptionsFactory {
  createXOTPModuleOptions(): XotpModuleOptions | Promise<XotpModuleOptions>;
}

export interface XotpModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<XotpOptionsFactory>;
  useClass?: Type<XotpOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<XotpModuleOptions> | XotpModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
  global?: boolean;
}
