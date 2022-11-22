import {
  SignatureConfigError,
  SymmetricAlgorithm,
  verifySignature,
} from "../src";
import * as testData from "./test-data";

describe("verifySignature", () => {
  it("throws if algorithm is invalid", () => {
    expect(() =>
      verifySignature(testData.payload, testData.HS256.validSignature, {
        algorithm: "INVALID" as SymmetricAlgorithm,
        secret: testData.HS256.options.secret,
      })
    ).toThrowError(SignatureConfigError);
  });

  it("reports valid HS256 signature to be valid", () => {
    const valid = verifySignature(
      testData.payload,
      testData.HS256.validSignature,
      testData.HS256.options
    );
    expect(valid).toBe(true);
  });

  it("reports invalid HS256 signature to be invalid", () => {
    const valid = verifySignature(
      testData.payload,
      testData.HS256.invalidSignature,
      testData.HS256.options
    );
    expect(valid).toBe(false);
  });

  it("reports valid RS256 signature to be valid", () => {
    const valid = verifySignature(
      testData.payload,
      testData.RS256.validSignature,
      testData.RS256.options
    );
    expect(valid).toBe(true);
  });

  it("reports invalid RS256 signature to be invalid", () => {
    const valid = verifySignature(
      testData.payload,
      testData.RS256.invalidSignature,
      testData.RS256.options
    );
    expect(valid).toBe(false);
  });
});
