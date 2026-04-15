import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020') as typeof import('ajv').default;
const addFormats = require('ajv-formats') as (ajv: InstanceType<typeof Ajv2020>) => void;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let ajvInstance: InstanceType<typeof Ajv2020> | null = null;

function getAjv(): InstanceType<typeof Ajv2020> {
  if (!ajvInstance) {
    ajvInstance = new Ajv2020({ allErrors: true, strict: false });
    (addFormats)(ajvInstance);
  }
  return ajvInstance;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export async function loadSchema(schemaPath: string): Promise<Record<string, unknown>> {
  const content = await readFile(schemaPath, 'utf-8');
  return JSON.parse(content) as Record<string, unknown>;
}

export async function loadBundledSchema(schemaName: string): Promise<Record<string, unknown>> {
  const schemaPath = resolve(__dirname, 'schemas', schemaName);
  return loadSchema(schemaPath);
}

export function validatePayload(schema: Record<string, unknown>, data: unknown): ValidationResult {
  const ajv = getAjv();
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors ?? []).map(
    (e: { instancePath?: string; message?: string }) => `${e.instancePath || '/'}: ${e.message ?? 'unknown error'}`
  );
  return { valid: false, errors };
}

export async function validateAgainstBundledSchema(
  schemaName: string,
  data: unknown
): Promise<ValidationResult> {
  const schema = await loadBundledSchema(schemaName);
  return validatePayload(schema, data);
}
