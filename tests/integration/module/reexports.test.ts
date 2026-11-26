import { HOTPOptions, TOTPOptions, TOTPVerifyResult } from '../../../src';

describe('package entry', () => {
  it('exposes option and result types from the package entry', () => {
    const totpOptions: Partial<TOTPOptions> = { duration: 30 };
    const hotpOptions: Partial<HOTPOptions> = { digits: 6 };
    const result: TOTPVerifyResult | undefined = undefined;

    expect(totpOptions.duration).toBe(30);
    expect(hotpOptions.digits).toBe(6);
    expect(result).toBeUndefined();
  });
});
