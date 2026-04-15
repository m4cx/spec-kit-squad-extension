export interface CompatibilityEntry {
  cli_version_range: string;
  supported: boolean;
  notes: string;
}

/**
 * Squad CLI compatibility matrix.
 * Kept as data so it can be extended without code changes.
 */
export const COMPATIBILITY_MATRIX: CompatibilityEntry[] = [
  {
    cli_version_range: '>=0.1.0 <1.0.0',
    supported: true,
    notes: 'Alpha range. Expect breaking changes. Extension uses graceful degradation.',
  },
  {
    cli_version_range: '>=1.0.0 <2.0.0',
    supported: true,
    notes: 'Stable range. Full feature support.',
  },
];

export interface CompatibilityDiagnostic {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggested_fix: string;
}

/**
 * Check Squad CLI version against compatibility matrix.
 * Returns actionable diagnostics.
 */
export function checkCompatibility(cliVersion: string | null): CompatibilityDiagnostic[] {
  const diagnostics: CompatibilityDiagnostic[] = [];

  if (!cliVersion) {
    diagnostics.push({
      code: 'SQUAD_CLI_NOT_FOUND',
      severity: 'error',
      message: 'Squad CLI is not installed or not available on PATH',
      suggested_fix: 'Install @bradygaster/squad-cli: npm install -g @bradygaster/squad-cli',
    });
    return diagnostics;
  }

  // Parse version (simple semver major.minor.patch)
  const versionMatch = cliVersion.match(/^v?(\d+)\.(\d+)\.(\d+)/);
  if (!versionMatch) {
    diagnostics.push({
      code: 'SQUAD_CLI_VERSION_UNPARSEABLE',
      severity: 'warning',
      message: `Cannot parse Squad CLI version: ${cliVersion}`,
      suggested_fix: 'Ensure squad --version returns a valid semver version',
    });
    return diagnostics;
  }

  const major = parseInt(versionMatch[1], 10);

  if (major === 0) {
    diagnostics.push({
      code: 'SQUAD_CLI_ALPHA',
      severity: 'warning',
      message: `Squad CLI version ${cliVersion} is in alpha range. Breaking changes may occur.`,
      suggested_fix: 'Pin your squad-cli version and test after upgrades',
    });
  }

  if (major >= 2) {
    diagnostics.push({
      code: 'SQUAD_CLI_UNTESTED',
      severity: 'warning',
      message: `Squad CLI version ${cliVersion} is beyond tested range. Behavior may differ.`,
      suggested_fix: 'Check extension release notes for updated compatibility information',
    });
  }

  return diagnostics;
}
