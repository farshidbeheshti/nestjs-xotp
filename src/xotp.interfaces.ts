import { ModuleMetadata, Type } from '@nestjs/common';
import { HOTPOptions, TOTPOptions } from 'xotp';

export type XOTPModuleOptions = Partial<TOTPOptions> &
  Partial<HOTPOptions> & { hotp?: Partial<HOTPOptions> } & {
    totp?: Partial<TOTPOptions>;
  };

export type XOTPForRootOptions = XOTPModuleOptions & {
  /** Register the module globally so it need not be imported elsewhere. */
  global?: boolean;
};

export interface XOTPOptionsFactory {
  createXOTPModuleOptions(): XOTPModuleOptions | Promise<XOTPModuleOptions>;
}

export interface XOTPModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<XOTPOptionsFactory>;
  useClass?: Type<XOTPOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<XOTPModuleOptions> | XOTPModuleOptions;
  inject?: any[];
  /** Register the module globally so it need not be imported elsewhere. */
  global?: boolean;
}
