import { XotpModule } from './xotp.module';
import { XotpService } from './services/xotp.service';
import { XotpTotpService } from './services/xotp.totp.service';
import { XotpHotpService } from './services/xotp.hotp.service';
import {
  XotpModuleAsyncOptions,
  XotpModuleOptions,
  XotpOptionsFactory,
} from './xotp.interfaces';

/**
 * Deprecated aliases for the previous class and type names. Each alias is
 * the same class or type as its replacement, so dependency injection keeps
 * working. They will be removed in the next major version.
 */

/** @deprecated Use `XotpModule` instead. */
export const XOTPModule = XotpModule;
/** @deprecated Use `XotpModule` instead. */
export type XOTPModule = XotpModule;

/** @deprecated Use `XotpService` instead. */
export const XOTPService = XotpService;
/** @deprecated Use `XotpService` instead. */
export type XOTPService = XotpService;

/** @deprecated Use `XotpTotpService` instead. */
export const XOTPTOTPService = XotpTotpService;
/** @deprecated Use `XotpTotpService` instead. */
export type XOTPTOTPService = XotpTotpService;

/** @deprecated Use `XotpHotpService` instead. */
export const XOTPHOTPService = XotpHotpService;
/** @deprecated Use `XotpHotpService` instead. */
export type XOTPHOTPService = XotpHotpService;

/** @deprecated Use `XotpModuleOptions` instead. */
export type XOTPModuleOptions = XotpModuleOptions;

/** @deprecated Use `XotpModuleAsyncOptions` instead. */
export type XOTPModuleAsyncOptions = XotpModuleAsyncOptions;

/** @deprecated Use `XotpOptionsFactory` instead. */
export type XOTPOptionsFactory = XotpOptionsFactory;
