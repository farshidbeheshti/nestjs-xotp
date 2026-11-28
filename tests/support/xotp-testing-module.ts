import { Test, TestingModule } from '@nestjs/testing';
import {
  XotpModule,
  XotpModuleAsyncOptions,
  XotpModuleOptions,
} from '../../src';

export async function compileForRootModule(
  options?: XotpModuleOptions,
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [XotpModule.forRoot(options)],
  }).compile();
}

export async function compileForRootAsyncModule(
  options: XotpModuleAsyncOptions,
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
  options: XotpModuleOptions | undefined,
  run: (module: TestingModule) => Promise<T> | T,
): Promise<T> {
  const module = await compileForRootModule(options);
  return withCompiledModule(module, run);
}

export async function withForRootAsyncModule<T>(
  options: XotpModuleAsyncOptions,
  run: (module: TestingModule) => Promise<T> | T,
): Promise<T> {
  const module = await compileForRootAsyncModule(options);
  return withCompiledModule(module, run);
}
