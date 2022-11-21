import Debug from "debug";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import jwa from "jwa";

// Constants
const symmetricAlgs = new Set(["HS256", "HS384", "HS512"]);
const asymmetricAlgs = new Set([
  "RS256",
  "RS384",
  "RS512",
  "PS256",
  "PS384",
  "PS512",
  "ES256",
  "ES384",
  "ES512",
]);

// Dependency initialization
const debug = Debug("ar:signature-validator");

// Types
export type Algorithm = SymmetricAlgorithm | AsymmetricAlgorithm;

export type SymmetricAlgorithm = "HS256" | "HS384" | "HS512";

export type AsymmetricAlgorithm =
  | "RS256"
  | "RS384"
  | "RS512"
  | "PS256"
  | "PS384"
  | "PS512"
  | "ES256"
  | "ES384"
  | "ES512";

export type SignatureConfig =
  | SymmetricSignatureConfig
  | AsymmetricSignatureConfig;

export interface SymmetricSignatureConfig {
  algorithm: SymmetricAlgorithm;
  secret: string;
}

export interface AsymmetricSignatureConfig {
  algorithm: AsymmetricAlgorithm;
  publicKeyPath: string;
}

interface ParsedSignatureConfig {
  algorithm: Algorithm;
  secret: string | Buffer;
}

export class SignatureConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignatureConfigError";
  }
}

export interface WebhookEvent {
  detectedAt: Date;
  attachments: Attachment[];
  event: APIResult;
}

export interface Attachment {
  mimeType: string;
  data: Buffer;
}

interface WebhookRequestBody {
  detectionTimestamp: number;
  attachments: { mimeType: string; data: string }[];
  event: APIResult;
}

export interface APIResult {
  mmr: MMRResult;
  plate: PlateResult;
}

export type MMRCategory = "UNK" | "BUS" | "CAR" | "HVT" | "LGT" | "VAN";

export interface MMRResult {
  found: boolean;
  category?: MMRCategory;
  categoryConfidence?: number;
  color?: Color;
  colorConfidence?: number;
  make?: string;
  makeConfidence?: number;
  model?: string;
  modelConfidence?: number;
  heading?: string;
  headingConfidence?: number;
  proctime: number;
}

export type PlateCategory =
  | "NONE"
  | "COMMON"
  | "CUSTOM"
  | "TAXI"
  | "DIPLOMATIC"
  | "EXPORT"
  | "OLD_TIMER"
  | "MOTORCYCLE"
  | "PUBLIC_TRANSPORT"
  | "COMMERCIAL"
  | "POLICE"
  | "GOVERNMENT"
  | "PROBATION"
  | "DRIVING_SCHOOL"
  | "TRAILER"
  | "ARMY"
  | "CONSULAR"
  | "EQUIPMENT"
  | "SECURITY_FORCES"
  | "PRIVATE_TRANSPORT"
  | "UNDER_EXPERIMENT"
  | "EMIRI_GUARDS"
  | "UN"
  | "LIMOUSINE"
  | "TEMP_TRANSIT";

export interface PlateResult {
  found: boolean;
  bgColor: Color;
  color: Color;
  category: PlateCategory;
  confidence: number;
  country: string;
  plateChars: PlateChar[];
  plateROI: RegionOfInterest;
  plateType: number;
  plateTypeConfidence: number;
  positionConfidence: number;
  proctime: number;
  state: string;
  unicodeText: string;
}

export interface PlateChar {
  bgColor: Color;
  color: Color;
  charROI: RegionOfInterest;
  code: number;
  confidence: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface RegionOfInterest {
  bottomLeft: Coords;
  bottomRight: Coords;
  topLeft: Coords;
  topRight: Coords;
}

export interface Coords {
  x: number;
  y: number;
}

// Public functions
export function webhookSignatureValidator(config: SignatureConfig) {
  const parsedConfig = parseConfig(config);
  logConfig(parsedConfig);

  return (req: Request, res: Response, next: NextFunction) => {
    let rawBody = "";
    const signature = req.headers["x-signature"] as string;

    if (typeof signature !== "string") {
      logAndSend(
        res,
        401,
        "Unauthorized: missing or duplicate signature header."
      );
    }

    req.setEncoding("utf8");
    req.on("data", function (chunk) {
      rawBody += chunk;
    });

    req.on("end", function () {
      if (!verify(rawBody, signature, parsedConfig)) {
        console.log(rawBody)
        logAndSend(res, 401, "Unauthorized: invalid signature.");
        return;
      }
      debug("Signature is valid.");
      req.body = parseEvent(rawBody);
      next();
    });
  };
}

export function verifySignature(
  payload: string,
  signature: string,
  config: SignatureConfig
): boolean {
  const parsedConfig = parseConfig(config);
  return verify(payload, signature, parsedConfig);
}

// Helper functions

function parseEvent(rawBody: string): WebhookEvent {
  const body: WebhookRequestBody = JSON.parse(rawBody);
  const event: WebhookEvent = {
    detectedAt: new Date(body.detectionTimestamp),
    attachments: [],
    event: body.event,
  };
  for (const attachment of body.attachments) {
    event.attachments.push({
      mimeType: attachment.mimeType,
      data: Buffer.from(attachment.data, "base64"),
    });
  }
  return event;
}

function logAndSend(res: Response, statusCode: number, message: string) {
  debug(message);
  res.status(statusCode).send(message);
}

function parseConfig(config: SignatureConfig): ParsedSignatureConfig {
  validateConfig(config);

  const parsedConfig: ParsedSignatureConfig = {
    algorithm: config.algorithm,
    secret: isSymmetric(config.algorithm)
      ? (config as SymmetricSignatureConfig).secret
      : fs.readFileSync((config as AsymmetricSignatureConfig).publicKeyPath),
  };

  return parsedConfig;
}

function logConfig(config: ParsedSignatureConfig) {
  debug("Webhook request signature verification enabled.");
  debug("  algorithm:        ", config.algorithm);
  debug("  secret/key length:", config.secret.length, "chars");
}

function validateConfig(config: SignatureConfig) {
  if (
    !symmetricAlgs.has(config.algorithm) &&
    !asymmetricAlgs.has(config.algorithm)
  ) {
    throw new SignatureConfigError(
      `FATAL: Unknown signature algorithm '${config.algorithm}'.`
    );
  }

  if (
    symmetricAlgs.has(config.algorithm) &&
    !(config as SymmetricSignatureConfig).secret
  ) {
    throw new SignatureConfigError(
      `FATAL: Signature secret must be set for symmetric algorithm '${config.algorithm}'.`
    );
  }

  if (
    asymmetricAlgs.has(config.algorithm) &&
    !(config as AsymmetricSignatureConfig).publicKeyPath
  ) {
    throw new SignatureConfigError(
      `FATAL: Signature public key path must be set for asymmetric algorithm '${config.algorithm}'.`
    );
  }

  if (
    asymmetricAlgs.has(config.algorithm) &&
    !fs.existsSync((config as AsymmetricSignatureConfig).publicKeyPath)
  ) {
    throw new SignatureConfigError(
      `FATAL: Signature public key path '${
        (config as AsymmetricSignatureConfig).publicKeyPath
      }' must exist.`
    );
  }
}

function verify(
  payload: string,
  signature: string,
  config: ParsedSignatureConfig
): boolean {
  const alg = jwa(config.algorithm);
  return alg.verify(payload, signature, config.secret as string);
}

function isSymmetric(alg: Algorithm): boolean {
  return symmetricAlgs.has(alg);
}

function isAsymmetric(alg: Algorithm): boolean {
  return asymmetricAlgs.has(alg);
}