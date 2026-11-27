import { Test, TestingModule } from '@nestjs/testing';
import {
  XotpModule,
  XOTPModuleAsyncOptions,
  XOTPModuleOptions,
} from '../../src';

export async function compileForRootModule(
  options?: XOTPModuleOptions,
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [XotpModule.forRoot(options)],
  }).compile();
}

export async function compileForRootAsyncModule(
  options: XOTPModuleAsyncOptions,
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [XotpModule.forRootAsync(options)],
  }).compile();
}

export async function withCompiledModule<T>(
  module: TestingModule,
  run: (compiled: TestingModule) => Promise<T> | T,
): Promise<T> {
  try {
    return await run(module);
  } finally {
    await module.close();
  }
}

export async function withForRootModule<T>(
  options: XOTPModuleOptions | undefined,
  run: (module: TestingModule) => Promise<T> | T,
): Promise<T> {
  const module = await compileForRootModule(options);
  return withCompiledModule(module, run);
}

export async function withForRootAsyncModule<T>(
  options: XOTPModuleAsyncOptions,
  run: (module: TestingModule) => Promise<T> | T,
): Promise<T> {
  const module = await compileForRootAsyncModule(options);
  return withCompiledModule(module, run);
}
